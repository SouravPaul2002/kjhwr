
from pydantic import BaseModel


class MatchedRecord(BaseModel):
    delivery_time: str
    forecast_publish_time: str
    forecast_generation: float
    actual_generation: float


class AccuracyMetrics(BaseModel):
    sample_count: int
    mae: float
    rmse: float
    bias: float


class AnalysisResponse(BaseModel):
    date_from: str
    date_to: str
    cutoff_rule: str
    metrics: AccuracyMetrics | None
    matched_records: list[MatchedRecord]
    message: str
