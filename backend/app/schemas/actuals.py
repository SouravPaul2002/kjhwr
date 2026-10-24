
from pydantic import BaseModel, ConfigDict


class ActualRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    dataset: str
    publishTime: str
    startTime: str
    settlementDate: str
    settlementPeriod: int
    fuelType: str
    generation: float


class ActualResponse(BaseModel):
    count: int
    data: list[ActualRecord]
