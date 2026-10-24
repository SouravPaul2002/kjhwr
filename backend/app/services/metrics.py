
from math import sqrt


def calculate_metrics(matched_records: list[dict]) -> dict:
    """
    Calculate forecast accuracy metrics from aligned records.

    Error convention:
        error = forecast_generation - actual_generation
    """

    if not matched_records:
        raise ValueError(
            "Cannot calculate metrics without matched records"
        )

    count = len(matched_records)
    total_error = 0.0
    total_abs_error = 0.0
    total_squared_error = 0.0

    for record in matched_records:
        forecast = float(record["forecast_generation"])
        actual = float(record["actual_generation"])
        error = forecast - actual

        total_error += error
        total_abs_error += abs(error)
        total_squared_error += error ** 2

    mae = total_abs_error / count
    rmse = sqrt(total_squared_error / count)
    bias = total_error / count

    return {
        "sample_count": count,
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "bias": round(bias, 2),
    }
