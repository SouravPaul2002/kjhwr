import httpx

WINDFOR_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream"


async def fetch_wind_forecasts(
    publish_from: str,
    publish_to: str,
) -> list[dict]:
    """
    Fetch wind generation forecasts from Elexon.
    """

    params = {
        "publishDateTimeFrom": publish_from,
        "publishDateTimeTo": publish_to,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(WINDFOR_URL, params=params)
        response.raise_for_status()
        data = response.json()

    if not isinstance(data, list):
        raise ValueError("Unexpected response format from Elexon WINDFOR API")

    return data
