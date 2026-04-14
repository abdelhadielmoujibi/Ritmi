from supabase import Client, create_client

from app.core.config import settings


def _ensure_supabase_env() -> None:
  if not settings.supabase_url or not settings.supabase_service_role_key:
    raise RuntimeError("Supabase environment variables are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")


def get_service_supabase() -> Client:
  _ensure_supabase_env()
  return create_client(settings.supabase_url, settings.supabase_service_role_key)
