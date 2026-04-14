from fastapi import APIRouter, Depends

from app.api.deps import get_repo, get_user_id
from app.repositories.supabase_repo import SupabaseRepository
from app.schemas.goal import MonthlyGoalCreate, MonthlyGoalResponse


router = APIRouter(prefix="/goals", tags=["goals"])


@router.post("", response_model=MonthlyGoalResponse)
def create_monthly_goal(
  payload: MonthlyGoalCreate,
  user_id: str = Depends(get_user_id),
  repo: SupabaseRepository = Depends(get_repo),
) -> MonthlyGoalResponse:
  row = repo.create_monthly_goal(user_id=user_id, payload=payload.model_dump())
  return MonthlyGoalResponse(**row)
