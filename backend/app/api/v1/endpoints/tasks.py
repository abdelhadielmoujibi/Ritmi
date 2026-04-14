from fastapi import APIRouter, Depends

from app.api.deps import get_repo, get_user_id
from app.repositories.supabase_repo import SupabaseRepository
from app.schemas.task import WeeklyTaskCreate, WeeklyTaskResponse


router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("", response_model=WeeklyTaskResponse)
def create_weekly_task(
  payload: WeeklyTaskCreate,
  user_id: str = Depends(get_user_id),
  repo: SupabaseRepository = Depends(get_repo),
) -> WeeklyTaskResponse:
  row = repo.create_weekly_task(user_id=user_id, payload=payload.model_dump())
  return WeeklyTaskResponse(**row)
