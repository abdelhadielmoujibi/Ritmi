from pydantic import BaseModel, Field


class DailyCheckinSubmit(BaseModel):
  energy: int = Field(ge=1, le=10)
  focus: int = Field(ge=1, le=10)
  stress: int = Field(ge=1, le=10)
  sleep_quality: int = Field(ge=1, le=10)
  motivation: int = Field(ge=1, le=10)
  available_time_minutes: int = Field(ge=15)
  checkin_date: str | None = None


class DailyCheckinResponse(BaseModel):
  id: str
  user_id: str
  checkin_date: str
  energy: int
  focus: int
  stress: int
  sleep_quality: int
  motivation: int
  available_time_minutes: int
  created_at: str
  updated_at: str
