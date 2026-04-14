from datetime import date

from supabase import Client


class SupabaseRepository:
  def __init__(self, client: Client) -> None:
    self.client = client

  def create_monthly_goal(self, user_id: str, payload: dict) -> dict:
    response = self.client.table("monthly_goals").insert({"user_id": user_id, **payload}).execute()
    return response.data[0]

  def create_weekly_task(self, user_id: str, payload: dict) -> dict:
    enriched = {
      "user_id": user_id,
      **payload,
      "completed_at": None if payload.get("status") != "completed" else date.today().isoformat(),
    }
    response = self.client.table("weekly_tasks").insert(enriched).execute()
    return response.data[0]

  def submit_daily_checkin(self, user_id: str, payload: dict) -> dict:
    checkin_date = payload.get("checkin_date") or date.today().isoformat()
    write_payload = {
      "user_id": user_id,
      "checkin_date": checkin_date,
      "energy": payload["energy"],
      "focus": payload["focus"],
      "stress": payload["stress"],
      "sleep_quality": payload["sleep_quality"],
      "motivation": payload["motivation"],
      "available_time_minutes": payload["available_time_minutes"],
    }

    self.client.table("daily_checkins").upsert(write_payload, on_conflict="user_id,checkin_date").execute()
    query = (
      self.client.table("daily_checkins")
      .select("*")
      .eq("user_id", user_id)
      .eq("checkin_date", checkin_date)
      .limit(1)
      .execute()
    )
    return query.data[0]

  def get_recent_checkins(self, user_id: str, limit: int = 7) -> list[dict]:
    response = (
      self.client.table("daily_checkins")
      .select("checkin_date,energy,focus,stress,sleep_quality,motivation,available_time_minutes")
      .eq("user_id", user_id)
      .order("checkin_date", desc=True)
      .limit(limit)
      .execute()
    )
    return response.data or []

  def get_pending_tasks(self, user_id: str, limit: int = 50) -> list[dict]:
    response = (
      self.client.table("weekly_tasks")
      .select("id,title,difficulty,priority,status,deadline_date")
      .eq("user_id", user_id)
      .eq("status", "pending")
      .order("created_at", desc=True)
      .limit(limit)
      .execute()
    )
    return response.data or []

  def save_daily_recommendation(self, user_id: str, checkin_id: str, payload: dict) -> dict:
    recommendation_date = payload.get("recommendation_date") or date.today().isoformat()
    recommended_mode = payload.get("recommended_mode", "light")
    mode_mapping = {
      "hard": "deep",
      "medium": "normal",
      "light": "light",
      "recovery": "recovery",
    }
    normalized_mode = mode_mapping.get(recommended_mode, "light")

    write_payload = {
      "user_id": user_id,
      "checkin_id": checkin_id,
      "recommendation_date": recommendation_date,
      "recommended_task": payload["recommended_task"],
      "recommended_mode": normalized_mode,
      "explanation": payload["explanation"],
      "avoid_text": payload["avoid_text"],
      "recovery_alert": payload["recovery_alert"],
      "recovery_actions": payload.get("recovery_actions", []),
      "recommended_task_id": payload.get("recommended_task_id"),
    }

    self.client.table("daily_recommendations").upsert(write_payload, on_conflict="user_id,recommendation_date").execute()

    query = (
      self.client.table("daily_recommendations")
      .select("*")
      .eq("user_id", user_id)
      .eq("recommendation_date", recommendation_date)
      .limit(1)
      .execute()
    )
    return query.data[0]

  def get_dashboard_data(self, user_id: str) -> dict:
    goals_count = self.client.table("monthly_goals").select("id", count="exact").eq("user_id", user_id).execute().count or 0
    tasks_total = self.client.table("weekly_tasks").select("id", count="exact").eq("user_id", user_id).execute().count or 0
    tasks_pending = (
      self.client.table("weekly_tasks").select("id", count="exact").eq("user_id", user_id).eq("status", "pending").execute().count or 0
    )
    tasks_completed = (
      self.client.table("weekly_tasks").select("id", count="exact").eq("user_id", user_id).eq("status", "completed").execute().count or 0
    )

    last_checkin_response = (
      self.client.table("daily_checkins").select("*").eq("user_id", user_id).order("checkin_date", desc=True).limit(1).execute()
    )
    today_recommendation_response = (
      self.client.table("daily_recommendations").select("*").eq("user_id", user_id).order("recommendation_date", desc=True).limit(1).execute()
    )

    return {
      "counts": {
        "monthly_goals": goals_count,
        "weekly_tasks_total": tasks_total,
        "weekly_tasks_pending": tasks_pending,
        "weekly_tasks_completed": tasks_completed,
      },
      "last_checkin": last_checkin_response.data[0] if last_checkin_response.data else None,
      "today_recommendation": today_recommendation_response.data[0] if today_recommendation_response.data else None,
    }

  def get_history_data(self, user_id: str, limit: int = 30) -> dict:
    checkins = self.client.table("daily_checkins").select("*").eq("user_id", user_id).order("checkin_date", desc=True).limit(limit).execute()
    recommendations = (
      self.client.table("daily_recommendations")
      .select("*")
      .eq("user_id", user_id)
      .order("recommendation_date", desc=True)
      .limit(limit)
      .execute()
    )
    return {
      "checkins": checkins.data or [],
      "recommendations": recommendations.data or [],
    }
