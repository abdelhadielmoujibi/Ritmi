from fastapi import APIRouter, Depends

from app.api.deps import get_repo, get_user_id
from app.repositories.supabase_repo import SupabaseRepository
from app.schemas.dashboard import DashboardDataResponse


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardDataResponse)
def get_dashboard_data(
  user_id: str = Depends(get_user_id),
  repo: SupabaseRepository = Depends(get_repo),
) -> DashboardDataResponse:
  data = repo.get_dashboard_data(user_id=user_id)
  return DashboardDataResponse(**data)
