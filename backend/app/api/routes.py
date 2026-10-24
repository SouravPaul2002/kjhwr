from datetime import datetime, date

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
