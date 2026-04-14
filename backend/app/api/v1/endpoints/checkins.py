from fastapi import APIRouter, Depends

from app.api.deps import get_repo, get_user_id
from app.repositories.supabase_repo import SupabaseRepository
from app.schemas.checkin import DailyCheckinResponse, DailyCheckinSubmit


router = APIRouter(prefix="/checkins", tags=["checkins"])


@router.post("", response_model=DailyCheckinResponse)
def submit_daily_checkin(
  payload: DailyCheckinSubmit,
  user_id: str = Depends(get_user_id),
  repo: SupabaseRepository = Depends(get_repo),
) -> DailyCheckinResponse:
  row = repo.submit_daily_checkin(user_id=user_id, payload=payload.model_dump())
  return DailyCheckinResponse(**row)
