from pydantic import BaseModel, Field


class MonthlyGoalCreate(BaseModel):
  title: str = Field(min_length=2, max_length=200)
  description: str | None = None
  priority: str | None = Field(default=None, pattern="^(low|medium|high)$")


class MonthlyGoalResponse(BaseModel):
  id: str
  user_id: str
  title: str
  description: str | None = None
  priority: str | None = None
  created_at: str
  updated_at: str
