
from datetime import datetime, timezone

from app.services.analysis import align_forecasts_with_actuals


forecasts = [
    {
        "publishTime": "2025-12-31T10:00:00Z",
        "startTime": "2026-01-01T00:00:00Z",
        "generation": 15000,
    },
    {
        "publishTime": "2025-12-31T11:00:00Z",
        "startTime": "2026-01-01T00:00:00Z",
        "generation": 15500,
    },
]

actuals = [
    {
        "startTime": "2026-01-01T00:00:00Z",
        "generation": 14000,
    },
    {
        "startTime": "2026-01-01T00:30:00Z",
        "generation": 16000,
    },
]

cutoffs = {
    "2026-01-01": datetime(
        2025, 12, 31, 12, 0,
        tzinfo=timezone.utc,
    )
}

result = align_forecasts_with_actuals(
    forecasts,
    actuals,
    cutoffs,
)

for record in result:
    print(record)
