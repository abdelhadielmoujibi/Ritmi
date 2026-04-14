from pydantic import BaseModel


class DashboardCounts(BaseModel):
  monthly_goals: int
  weekly_tasks_total: int
  weekly_tasks_pending: int
  weekly_tasks_completed: int


class DashboardDataResponse(BaseModel):
  counts: DashboardCounts
  last_checkin: dict | None = None
  today_recommendation: dict | None = None
