from datetime import timedelta, timezone, time, datetime, date

from app.schemas.analysis import AnalysisResponse, AccuracyMetrics
from app.services.analysis import align_forecasts_with_actuals
from app.services.metrics import calculate_metrics

from app.schemas.actuals import ActualRecord, ActualResponse
from app.services.actuals import fetch_wind_actuals

from fastapi import APIRouter, HTTPException, Query
import httpx

from app.schemas.forecast import ForecastRecord, ForecastResponse
from app.services.forecast import fetch_wind_forecasts

router = APIRouter()


@router.get(
    "/forecasts",
    response_model=ForecastResponse,
)
async def get_forecasts(
    publish_from: datetime = Query(
        ...,
        description="Forecast publication start time",
    ),
    publish_to: datetime = Query(
        ...,
        description="Forecast publication end time",
    ),
):
    if publish_from >= publish_to:
        raise HTTPException(
            status_code=400,
            detail="publish_from must be earlier than publish_to",
        )

    try:
        records = await fetch_wind_forecasts(
            publish_from=publish_from.isoformat(),
            publish_to=publish_to.isoformat(),
        )

        forecasts = []
        for record in records:
            validated_record = ForecastRecord.model_validate(record)
            forecasts.append(validated_record)

        return ForecastResponse(
            count=len(forecasts),
            data=forecasts,
        )

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail="Elexon returned an unsuccessful response",
        ) from exc

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail="Unable to connect to the Elexon API",
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=502,
            detail="Invalid response received from Elexon",
        ) from exc




@router.get(
    "/actuals",
    response_model=ActualResponse,
)
async def get_actuals(
    date_from: date = Query(
        ...,
        description="Start settlement date (YYYY-MM-DD)",
    ),
    date_to: date = Query(
        ...,
        description="End settlement date (YYYY-MM-DD)",
    ),
):
    if date_from > date_to:
        raise HTTPException(
            status_code=400,
            detail="date_from must be earlier than or equal to date_to",
        )

    try:
        records = await fetch_wind_actuals(
            date_from=date_from.isoformat(),
            date_to=date_to.isoformat(),
        )

        actuals = []
        for record in records:
            validated_record = ActualRecord.model_validate(record)
            actuals.append(validated_record)

        return ActualResponse(
            count=len(actuals),
            data=actuals,
        )

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail="Elexon returned an unsuccessful response",
        ) from exc

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail="Unable to connect to the Elexon API",
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=502,
            detail="Invalid response received from Elexon",
        ) from exc




@router.get(
    "/analysis",
    response_model=AnalysisResponse,
)
async def get_analysis(
    date_from: date = Query(
        ...,
        description="First delivery date (YYYY-MM-DD)",
    ),
    date_to: date = Query(
        ...,
        description="Last delivery date (YYYY-MM-DD)",
    ),
    cutoff_hour_utc: int = Query(
        ...,
        ge=0,
        le=23,
        description=(
            "Assumed purchasing cutoff hour in UTC "
            "on the day before each delivery date"
        ),
    ),
):
    if date_from > date_to:
        raise HTTPException(
            status_code=400,
            detail="date_from must be earlier than or equal to date_to",
        )

    try:
        # This implementation is intended for the January 2026 analysis.
        if date_from < date(2026, 1, 1) or date_to > date(2026, 1, 31):
            raise HTTPException(
                status_code=400,
                detail="This analysis endpoint currently supports January 2026 only",
            )

        # Assume the purchasing cutoff is on the previous day.
        cutoffs = {}

        current_date = date_from

        while current_date <= date_to:
            cutoff_date = current_date - timedelta(days=1)

            cutoffs[current_date.isoformat()] = datetime.combine(
                cutoff_date,
                time(hour=cutoff_hour_utc),
                tzinfo=timezone.utc,
            )

            current_date += timedelta(days=1)

        # Fetch actuals for the requested delivery dates.
        actuals = await fetch_wind_actuals(
            date_from=date_from.isoformat(),
            date_to=date_to.isoformat(),
        )

        # Include publication history before the first cutoff.
        publish_from = (
            datetime.combine(
                date_from - timedelta(days=2),
                time(hour=cutoff_hour_utc),
                tzinfo=timezone.utc,
            )
        )

        last_cutoff = cutoffs[date_to.isoformat()]

        forecasts = await fetch_wind_forecasts(
            publish_from=publish_from.isoformat(),
            publish_to=last_cutoff.isoformat(),
        )

        matched = align_forecasts_with_actuals(
            forecasts=forecasts,
            actuals=actuals,
            cutoff_by_delivery_date=cutoffs,
        )

        # Keep only requested delivery dates.
        matched = [
            record
            for record in matched
            if date_from.isoformat()
            <= record["delivery_time"][:10]
            <= date_to.isoformat()
        ]

        metrics = (
            AccuracyMetrics(**calculate_metrics(matched))
            if matched
            else None
        )

        return AnalysisResponse(
            date_from=date_from.isoformat(),
            date_to=date_to.isoformat(),
            cutoff_rule=(
                f"Previous day at {cutoff_hour_utc:02d}:00 UTC; "
                "assumption requiring confirmation"
            ),
            metrics=metrics,
            matched_records=matched,
            message=(
                "Analysis completed"
                if matched
                else "No matched forecast and actual records found"
            ),
        )

    except HTTPException:
        raise

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail="Elexon returned an unsuccessful response",
        ) from exc

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail="Unable to connect to the Elexon API",
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unable to process Elexon data: {exc}",
        ) from exc
