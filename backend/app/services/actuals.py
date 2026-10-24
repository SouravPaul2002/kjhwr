
import httpx

FUELHH_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream"


async def fetch_wind_actuals(
    date_from: str,
    date_to: str,
) -> list[dict]:
    """
    Fetch actual national wind generation from Elexon.
    """

    params = {
        "settlementDateFrom": date_from,
        "settlementDateTo": date_to,
        "fuelType": "WIND",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(FUELHH_URL, params=params)
        response.raise_for_status()
        data = response.json()

    if not isinstance(data, list):
        raise ValueError(
            "Unexpected response format from Elexon FUELHH API"
        )

    return data
