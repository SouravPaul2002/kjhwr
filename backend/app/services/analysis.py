
from collections import defaultdict
from datetime import datetime, timezone


def parse_utc(value: str) -> datetime:
    """Parse an ISO timestamp and normalize it to UTC."""
    dt = datetime.fromisoformat(value.replace("Z", "+00:00"))

    if dt.tzinfo is None:
        raise ValueError(f"Timestamp has no timezone: {value}")

    return dt.astimezone(timezone.utc)


def aggregate_actuals_hourly(
    actuals: list[dict],
) -> dict[datetime, float]:
    """
    Aggregate half-hourly actual generation into hourly averages.

    Only hours with exactly two valid half-hourly records are kept.
    """
    hourly_values = defaultdict(list)

    for record in actuals:
        start_time = parse_utc(record["startTime"])

        hour_start = start_time.replace(
            minute=0,
            second=0,
            microsecond=0,
        )

        hourly_values[hour_start].append(
            float(record["generation"])
        )

    hourly_actuals = {}

    for hour, values in hourly_values.items():
        if len(values) == 2:
            hourly_actuals[hour] = sum(values) / 2

    return hourly_actuals


def align_forecasts_with_actuals(
    forecasts: list[dict],
    actuals: list[dict],
    cutoff_by_delivery_date: dict[str, datetime],
) -> list[dict]:
    """
    Match hourly forecasts with hourly actual generation.

    cutoff_by_delivery_date maps each delivery date (YYYY-MM-DD)
    to the latest permitted forecast publication time in UTC.
    """

    hourly_actuals = aggregate_actuals_hourly(actuals)

    # Keep the latest eligible publication for each delivery hour.
    selected_forecasts = {}

    for record in forecasts:
        delivery_time = parse_utc(record["startTime"])
        publish_time = parse_utc(record["publishTime"])

        delivery_date = delivery_time.date().isoformat()
        cutoff = cutoff_by_delivery_date.get(delivery_date)

        if cutoff is None:
            continue

        if cutoff.tzinfo is None:
            raise ValueError("Every cutoff must include a timezone")

        cutoff = cutoff.astimezone(timezone.utc)

        if publish_time > cutoff:
            continue

        current = selected_forecasts.get(delivery_time)

        if current is None or publish_time > current["publish_time"]:
            selected_forecasts[delivery_time] = {
                "publish_time": publish_time,
                "generation": float(record["generation"]),
            }

    matched = []

    for delivery_time, forecast in sorted(
        selected_forecasts.items()
    ):
        actual_generation = hourly_actuals.get(delivery_time)

        if actual_generation is None:
            continue

        matched.append({
            "delivery_time": delivery_time.isoformat(),
            "forecast_publish_time": forecast["publish_time"].isoformat(),
            "forecast_generation": forecast["generation"],
            "actual_generation": actual_generation,
        })

    return matched
