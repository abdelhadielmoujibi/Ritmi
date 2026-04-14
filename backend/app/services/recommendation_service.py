from datetime import date

from app.schemas.checkin import DailyCheckinSubmit
from app.schemas.recommendation import (
  DailyRecommendationResultResponse,
  DailyRecommendationResponse,
  DailyRecommendationWithAIResponse,
  PendingTaskInput,
  RuleDecisionResponse,
  TaskSelectionResponse,
)
from app.services.ai_explainer import generate_ai_explanation
from app.services.rules_engine import choose_task_intensity, classify_day_state
from app.services.streak_detector import has_four_consecutive_negative_days, is_negative_day, negative_streak_count
from app.services.task_selector import select_best_task_for_today


def _to_checkin_dict(payload: DailyCheckinSubmit) -> dict:
  return {
    "checkin_date": payload.checkin_date or date.today().isoformat(),
    "energy": payload.energy,
    "focus": payload.focus,
    "stress": payload.stress,
    "sleep_quality": payload.sleep_quality,
    "motivation": payload.motivation,
    "available_time_minutes": payload.available_time_minutes,
  }


def run_rule_decision_engine(
  current_checkin: DailyCheckinSubmit,
  previous_checkins: list[dict] | None = None,
) -> RuleDecisionResponse:
  """
  Main rule-based decision utility for MVP.

  - builds negative streak context
  - determines recovery mode
  - classifies current day state
  - maps day state to recommended task intensity
  """
  history = list(previous_checkins or [])
  history.append(_to_checkin_dict(current_checkin))

  recovery_mode = has_four_consecutive_negative_days(history)
  day_state, reasons = classify_day_state(current_checkin, recovery_mode=recovery_mode)
  recommended_intensity = choose_task_intensity(day_state)
  streak_count = negative_streak_count(history)
  negative_today = is_negative_day(current_checkin)

  threshold_summary = [
    *reasons,
    "negative day = >=3 bad indicators",
    "recovery mode = 4 consecutive negative days",
  ]

  return RuleDecisionResponse(
    day_state=day_state,
    recommended_intensity=recommended_intensity,
    recovery_mode=recovery_mode,
    negative_today=negative_today,
    negative_streak_count=streak_count,
    threshold_summary=threshold_summary,
  )


def run_task_selection(
  day_state: str,
  recovery_mode: bool,
  pending_tasks: list[PendingTaskInput],
) -> TaskSelectionResponse:
  selected_task, recommended_intensity, strategy_notes = select_best_task_for_today(
    day_state=day_state,
    recovery_mode=recovery_mode,
    tasks=[task.model_dump() for task in pending_tasks],
  )

  task_model = PendingTaskInput(**selected_task) if selected_task else None
  return TaskSelectionResponse(
    selected_task=task_model,
    recommended_intensity=recommended_intensity,
    strategy_notes=strategy_notes,
  )


def run_daily_recommendation_flow(
  current_checkin: DailyCheckinSubmit,
  previous_checkins: list[dict],
  pending_tasks: list[PendingTaskInput],
) -> DailyRecommendationResponse:
  rule_decision = run_rule_decision_engine(
    current_checkin=current_checkin,
    previous_checkins=previous_checkins,
  )

  task_selection = run_task_selection(
    day_state=rule_decision.day_state,
    recovery_mode=rule_decision.recovery_mode,
    pending_tasks=pending_tasks,
  )

  return DailyRecommendationResponse(
    rule_decision=rule_decision,
    task_selection=task_selection,
  )


def generate_daily_recommendation_result(
  current_checkin: DailyCheckinSubmit,
  previous_checkins: list[dict],
  pending_tasks: list[PendingTaskInput],
) -> DailyRecommendationResultResponse:
  """
  Step 12 final output for frontend/AI layer:
  - recommended_task
  - recommended_mode
  - recovery_alert
  - internal_explanation_data
  """
  flow = run_daily_recommendation_flow(
    current_checkin=current_checkin,
    previous_checkins=previous_checkins,
    pending_tasks=pending_tasks,
  )

  selected = flow.task_selection.selected_task

  if selected:
    recommended_task = selected.title
  elif flow.rule_decision.recovery_mode:
    recommended_task = "Recovery action only: choose one light review or rest routine"
  else:
    recommended_task = "No pending task available. Create a light or medium task first"

  recommended_mode = _to_recommended_mode(flow.task_selection.recommended_intensity)

  avoid_text = _build_avoid_text(
    day_state=flow.rule_decision.day_state,
    recovery_mode=flow.rule_decision.recovery_mode,
    recommended_mode=recommended_mode,
  )

  internal_explanation_data = {
    "day_state": flow.rule_decision.day_state,
    "negative_today": flow.rule_decision.negative_today,
    "negative_streak_count": flow.rule_decision.negative_streak_count,
    "threshold_summary": flow.rule_decision.threshold_summary,
    "task_selection_notes": flow.task_selection.strategy_notes,
    "recommended_intensity": flow.task_selection.recommended_intensity,
    "selected_task": selected.model_dump() if selected else None,
    "avoid_text": avoid_text,
  }

  return DailyRecommendationResultResponse(
    recommended_task=recommended_task,
    recommended_mode=recommended_mode,
    recovery_alert=flow.rule_decision.recovery_mode,
    avoid_text=avoid_text,
    internal_explanation_data=internal_explanation_data,
  )


def generate_daily_recommendation_with_ai(
  current_checkin: DailyCheckinSubmit,
  previous_checkins: list[dict],
  pending_tasks: list[PendingTaskInput],
) -> DailyRecommendationWithAIResponse:
  base_result = generate_daily_recommendation_result(
    current_checkin=current_checkin,
    previous_checkins=previous_checkins,
    pending_tasks=pending_tasks,
  )

  ai_text = generate_ai_explanation(base_result)

  return DailyRecommendationWithAIResponse(
    recommended_task=base_result.recommended_task,
    recommended_mode=base_result.recommended_mode,
    recovery_alert=base_result.recovery_alert,
    short_explanation=ai_text.short_explanation,
    supportive_recommendation=ai_text.supportive_recommendation,
    avoid_text=ai_text.avoid_text,
    recovery_advice=ai_text.recovery_advice,
    internal_explanation_data=base_result.internal_explanation_data,
    ai_source=ai_text.ai_source,
  )


def _build_avoid_text(day_state: str, recovery_mode: bool, recommended_mode: str) -> str:
  if recovery_mode or day_state == "recovery-needed day" or recommended_mode == "recovery":
    return "Avoid starting hard tasks today. Focus on one light action and protect your recovery."
  if day_state == "low-energy day" or recommended_mode == "light":
    return "Avoid heavy deep-work blocks and overloading your schedule today."
  if day_state == "normal day":
    return "Avoid task switching and trying to finish too many tasks at once."
  return "Avoid distractions and unplanned context switching during your focus blocks."


def _to_recommended_mode(recommended_intensity: str) -> str:
  mapping = {
    "hard": "deep",
    "medium": "normal",
    "light": "light",
    "recovery": "recovery",
  }
  return mapping.get(recommended_intensity, "light")
