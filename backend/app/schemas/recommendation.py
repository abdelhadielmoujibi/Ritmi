from typing import Any

from pydantic import BaseModel, Field

from app.schemas.checkin import DailyCheckinSubmit


class RuleDecisionRequest(BaseModel):
  current_checkin: DailyCheckinSubmit
  previous_checkins: list[dict] = Field(default_factory=list)


class RuleDecisionResponse(BaseModel):
  day_state: str
  recommended_intensity: str
  recovery_mode: bool
  negative_today: bool
  negative_streak_count: int
  threshold_summary: list[str]


class PendingTaskInput(BaseModel):
  id: str
  title: str
  difficulty: str
  priority: str
  status: str = "pending"
  deadline_date: str | None = None


class TaskSelectionRequest(BaseModel):
  day_state: str
  recovery_mode: bool
  pending_tasks: list[PendingTaskInput] = Field(default_factory=list)


class TaskSelectionResponse(BaseModel):
  selected_task: PendingTaskInput | None = None
  recommended_intensity: str
  strategy_notes: list[str]


class DailyRecommendationRequest(BaseModel):
  current_checkin: DailyCheckinSubmit
  previous_checkins: list[dict] = Field(default_factory=list)
  pending_tasks: list[PendingTaskInput] = Field(default_factory=list)


class DailyRecommendationFromDBRequest(BaseModel):
  current_checkin: DailyCheckinSubmit


class DailyRecommendationResponse(BaseModel):
  rule_decision: RuleDecisionResponse
  task_selection: TaskSelectionResponse


class DailyRecommendationResultResponse(BaseModel):
  recommended_task: str
  recommended_mode: str
  recovery_alert: bool
  avoid_text: str
  internal_explanation_data: dict[str, Any]


class AIRecommendationTextResponse(BaseModel):
  short_explanation: str
  supportive_recommendation: str
  avoid_text: str
  recovery_advice: list[str]
  ai_source: str


class DailyRecommendationWithAIResponse(BaseModel):
  recommended_task: str
  recommended_mode: str
  recovery_alert: bool
  short_explanation: str
  supportive_recommendation: str
  avoid_text: str
  recovery_advice: list[str]
  internal_explanation_data: dict[str, Any]
  ai_source: str


class DailyRecommendationStoredResponse(BaseModel):
  recommendation_id: str
  checkin_id: str
  recommended_task: str
  recommended_mode: str
  recovery_alert: bool
  short_explanation: str
  supportive_recommendation: str
  avoid_text: str
  recovery_advice: list[str]
  ai_source: str
