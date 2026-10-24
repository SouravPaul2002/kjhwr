
from app.services.metrics import calculate_metrics


records = [
    {"forecast_generation": 110, "actual_generation": 100},
    {"forecast_generation": 180, "actual_generation": 200},
    {"forecast_generation": 330, "actual_generation": 300},
]

result = calculate_metrics(records)

print(result)

assert result["sample_count"] == 3
assert result["mae"] == 20.00
assert result["rmse"] == 21.60
assert result["bias"] == 6.67
