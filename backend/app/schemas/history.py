from pydantic import BaseModel


class CheckinHistoryItem(BaseModel):
  id: str
  checkin_date: str
  energy: int
  focus: int
  stress: int
  sleep_quality: int
  motivation: int
  available_time_minutes: int


class RecommendationHistoryItem(BaseModel):
  id: str
  recommendation_date: str
  recommended_task: str
  recommended_mode: str
  explanation: str
  avoid_text: str
  recovery_alert: bool
  recovery_actions: list[str] | None = None


class HistoryDataResponse(BaseModel):
  checkins: list[CheckinHistoryItem]
  recommendations: list[RecommendationHistoryItem]
