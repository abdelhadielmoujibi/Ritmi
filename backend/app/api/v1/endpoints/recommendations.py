from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_repo, get_user_id
from app.repositories.supabase_repo import SupabaseRepository
from app.schemas.recommendation import (
  DailyRecommendationFromDBRequest,
  DailyRecommendationRequest,
  DailyRecommendationResponse,
  DailyRecommendationResultResponse,
  DailyRecommendationStoredResponse,
  DailyRecommendationWithAIResponse,
  PendingTaskInput,
  RuleDecisionRequest,
  RuleDecisionResponse,
  TaskSelectionRequest,
  TaskSelectionResponse,
)
from app.services.recommendation_service import (
  generate_daily_recommendation_result,
  generate_daily_recommendation_with_ai,
  run_daily_recommendation_flow,
  run_rule_decision_engine,
  run_task_selection,
)


router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.post("/rules", response_model=RuleDecisionResponse)
def run_rules(payload: RuleDecisionRequest) -> RuleDecisionResponse:
  return run_rule_decision_engine(
    current_checkin=payload.current_checkin,
    previous_checkins=payload.previous_checkins,
  )


@router.post("/select-task", response_model=TaskSelectionResponse)
def select_task(payload: TaskSelectionRequest) -> TaskSelectionResponse:
  return run_task_selection(
    day_state=payload.day_state,
    recovery_mode=payload.recovery_mode,
    pending_tasks=payload.pending_tasks,
  )


@router.post("/daily", response_model=DailyRecommendationResponse)
def daily_recommendation(payload: DailyRecommendationRequest) -> DailyRecommendationResponse:
  return run_daily_recommendation_flow(
    current_checkin=payload.current_checkin,
    previous_checkins=payload.previous_checkins,
    pending_tasks=payload.pending_tasks,
  )


@router.post("/generate", response_model=DailyRecommendationResultResponse)
def generate_recommendation(payload: DailyRecommendationRequest) -> DailyRecommendationResultResponse:
  return generate_daily_recommendation_result(
    current_checkin=payload.current_checkin,
    previous_checkins=payload.previous_checkins,
    pending_tasks=payload.pending_tasks,
  )


@router.post("/generate-ai", response_model=DailyRecommendationWithAIResponse)
def generate_recommendation_with_ai(payload: DailyRecommendationRequest) -> DailyRecommendationWithAIResponse:
  return generate_daily_recommendation_with_ai(
    current_checkin=payload.current_checkin,
    previous_checkins=payload.previous_checkins,
    pending_tasks=payload.pending_tasks,
  )


@router.post("/generate-and-save", response_model=DailyRecommendationStoredResponse)
def generate_and_save_recommendation(
  payload: DailyRecommendationFromDBRequest,
  user_id: str = Depends(get_user_id),
  repo: SupabaseRepository = Depends(get_repo),
) -> DailyRecommendationStoredResponse:
  try:
    # 1) Save today's check-in first (upsert by user/date)
    checkin_row = repo.submit_daily_checkin(user_id=user_id, payload=payload.current_checkin.model_dump())

    # 2) Fetch context from DB
    checkin_date = checkin_row["checkin_date"]
    recent_checkins = repo.get_recent_checkins(user_id=user_id, limit=7)
    previous_checkins = [item for item in recent_checkins if item.get("checkin_date") != checkin_date]
    pending_tasks = [PendingTaskInput(**row) for row in repo.get_pending_tasks(user_id=user_id, limit=50)]

    # 3) Generate recommendation + AI text
    result = generate_daily_recommendation_with_ai(
      current_checkin=payload.current_checkin,
      previous_checkins=previous_checkins,
      pending_tasks=pending_tasks,
    )

    selected_task = result.internal_explanation_data.get("selected_task") or {}
    recommended_task_id = selected_task.get("id")

    # 4) Persist final daily recommendation
    saved = repo.save_daily_recommendation(
      user_id=user_id,
      checkin_id=checkin_row["id"],
      payload={
        "recommended_task": result.recommended_task,
        "recommended_mode": result.recommended_mode,
        "explanation": result.supportive_recommendation,
        "avoid_text": result.avoid_text,
        "recovery_alert": result.recovery_alert,
        "recovery_actions": result.recovery_advice,
        "recommended_task_id": recommended_task_id,
        "recommendation_date": checkin_date,
      },
    )

    return DailyRecommendationStoredResponse(
      recommendation_id=saved["id"],
      checkin_id=checkin_row["id"],
      recommended_task=result.recommended_task,
      recommended_mode=result.recommended_mode,
      recovery_alert=result.recovery_alert,
      short_explanation=result.short_explanation,
      supportive_recommendation=result.supportive_recommendation,
      avoid_text=result.avoid_text,
      recovery_advice=result.recovery_advice,
      ai_source=result.ai_source,
    )
  except Exception as exc:
    raise HTTPException(status_code=500, detail=f"generate-and-save failed: {str(exc)}") from exc
