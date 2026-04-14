from pydantic import BaseModel, Field


class WeeklyTaskCreate(BaseModel):
  goal_id: str
  title: str = Field(min_length=2, max_length=200)
  description: str | None = None
  difficulty: str = Field(pattern="^(light|medium|hard)$")
  priority: str = Field(pattern="^(low|medium|high)$")
  deadline_date: str | None = None
  status: str = Field(default="pending", pattern="^(pending|completed)$")


class WeeklyTaskResponse(BaseModel):
  id: str
  user_id: str
  goal_id: str
  title: str
  description: str | None = None
  difficulty: str
  priority: str
  deadline_date: str | None = None
  status: str
  completed_at: str | None = None
  created_at: str
  updated_at: str
