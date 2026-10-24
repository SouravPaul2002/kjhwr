import asyncio
from app.services.forecast import fetch_wind_forecasts


async def main():
    forecasts = await fetch_wind_forecasts(
        publish_from="2026-01-01T00:00:00Z",
        publish_to="2026-01-01T03:00:00Z",
    )

    print(f"Total records: {len(forecasts)}")

    for forecast in forecasts[:5]:
        print(forecast)


if __name__ == "__main__":
    asyncio.run(main())
