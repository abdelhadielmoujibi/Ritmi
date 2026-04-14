from fastapi import Depends, Header, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import httpx

from app.core.config import settings

from app.core.supabase import get_service_supabase
from app.repositories.supabase_repo import SupabaseRepository


def get_repo() -> SupabaseRepository:
  return SupabaseRepository(get_service_supabase())


bearer = HTTPBearer(auto_error=False)


def _fetch_supabase_user(access_token: str) -> dict:
  if not settings.supabase_url or not settings.supabase_anon_key:
    raise HTTPException(status_code=500, detail="Supabase auth environment variables are missing")

  with httpx.Client(timeout=10) as client:
    response = client.get(
      f"{settings.supabase_url}/auth/v1/user",
      headers={
        "Authorization": f"Bearer {access_token}",
        "apikey": settings.supabase_anon_key,
      },
    )

  if response.status_code != 200:
    raise HTTPException(status_code=401, detail="Invalid or expired Supabase access token")

  return response.json()


def get_user_id(
  credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
  x_user_id: str | None = Header(default=None, alias="X-User-Id"),
) -> str:
  # Dev-only fallback to simplify local testing.
  if settings.app_env == "development" and x_user_id:
    return x_user_id

  if not credentials or credentials.scheme.lower() != "bearer":
    raise HTTPException(status_code=401, detail="Missing Bearer token")

  user = _fetch_supabase_user(credentials.credentials)
  user_id = user.get("id")
  if not user_id:
    raise HTTPException(status_code=401, detail="Unable to resolve authenticated user")

  return user_id


RepoDep = Depends(get_repo)
UserIdDep = Depends(get_user_id)
