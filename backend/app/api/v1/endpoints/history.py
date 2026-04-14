from fastapi import APIRouter, Depends, Query

from app.api.deps import get_repo, get_user_id
from app.repositories.supabase_repo import SupabaseRepository
from app.schemas.history import HistoryDataResponse


router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=HistoryDataResponse)
def get_history_data(
  limit: int = Query(default=30, ge=1, le=90),
  user_id: str = Depends(get_user_id),
  repo: SupabaseRepository = Depends(get_repo),
) -> HistoryDataResponse:
  data = repo.get_history_data(user_id=user_id, limit=limit)
  return HistoryDataResponse(**data)
