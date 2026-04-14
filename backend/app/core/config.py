from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  app_name: str = "StudyPulse AI API"
  app_env: str = "development"
  app_port: int = 8000
  app_host: str = "0.0.0.0"
  cors_origins: str = "http://localhost:3000"

  supabase_url: str = ""
  supabase_anon_key: str = ""
  supabase_service_role_key: str = ""

  openai_api_key: str = ""
  openai_model: str = "gpt-4o-mini"
  openai_timeout_seconds: int = 20

  model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
