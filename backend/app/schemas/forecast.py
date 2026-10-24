
from pydantic import BaseModel, ConfigDict


class ForecastRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    dataset: str
    publishTime: str
    startTime: str
    generation: float


class ForecastResponse(BaseModel):
    count: int
    data: list[ForecastRecord]
