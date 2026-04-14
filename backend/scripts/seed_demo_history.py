from __future__ import annotations

from datetime import date, timedelta
from pathlib import Path

from supabase import Client, create_client


def load_env(path: Path) -> dict[str, str]:
  values: dict[str, str] = {}
  if not path.exists():
    return values

  for line in path.read_text(encoding="utf-8").splitlines():
    raw = line.strip()
    if not raw or raw.startswith("#") or "=" not in raw:
      continue
    key, value = raw.split("=", 1)
    values[key.strip()] = value.strip()
  return values


def get_client() -> Client:
  env = load_env(Path(__file__).resolve().parents[1] / ".env")
  url = env.get("SUPABASE_URL", "")
  key = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
  if not url or not key:
    raise RuntimeError("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in backend/.env")
  return create_client(url, key)


def detect_user_id(client: Client) -> str:
  candidates = [
    ("daily_checkins", "user_id"),
    ("daily_recommendations", "user_id"),
    ("weekly_tasks", "user_id"),
    ("monthly_goals", "user_id"),
    ("profiles", "id"),
  ]

  for table, field in candidates:
    res = client.table(table).select(field).limit(1).execute()
    if res.data:
      value = res.data[0].get(field)
      if value:
        return str(value)

  raise RuntimeError("No user found. Create an account first, then run this script.")


def ensure_demo_goals(client: Client, user_id: str) -> list[dict]:
  wanted = [
    {"title": "Prepare for database midterm", "description": "Revise SQL joins, aggregations, and indexing", "priority": "high"},
    {"title": "Finish operating systems revision", "description": "Review process scheduling and memory management", "priority": "medium"},
  ]

  existing = client.table("monthly_goals").select("id,title").eq("user_id", user_id).execute().data or []
  by_title = {row["title"]: row for row in existing}
  goal_rows: list[dict] = []

  for item in wanted:
    if item["title"] in by_title:
      goal_rows.append(by_title[item["title"]])
      continue
    created = client.table("monthly_goals").insert({"user_id": user_id, **item}).execute().data[0]
    goal_rows.append(created)

  return goal_rows


def ensure_demo_tasks(client: Client, user_id: str, goals: list[dict]) -> None:
  if not goals:
    return

  primary_goal_id = goals[0]["id"]
  secondary_goal_id = goals[1]["id"] if len(goals) > 1 else goals[0]["id"]

  wanted = [
    {
      "goal_id": primary_goal_id,
      "title": "Solve 15 SQL exercises (JOIN, GROUP BY)",
      "description": "Practice complex joins and grouped queries",
      "difficulty": "hard",
      "priority": "high",
      "status": "pending",
      "deadline_date": (date.today() + timedelta(days=2)).isoformat(),
    },
    {
      "goal_id": primary_goal_id,
      "title": "Review database notes for 30 minutes",
      "description": "Quick summary pass over key database concepts",
      "difficulty": "light",
      "priority": "high",
      "status": "pending",
      "deadline_date": (date.today() + timedelta(days=1)).isoformat(),
    },
    {
      "goal_id": secondary_goal_id,
      "title": "Summarize scheduler algorithms",
      "description": "Create one-page summary for FCFS/SJF/RR",
      "difficulty": "medium",
      "priority": "medium",
      "status": "pending",
      "deadline_date": (date.today() + timedelta(days=4)).isoformat(),
    },
  ]

  existing = client.table("weekly_tasks").select("title").eq("user_id", user_id).execute().data or []
  existing_titles = {row["title"] for row in existing}

  for task in wanted:
    if task["title"] in existing_titles:
      continue
    client.table("weekly_tasks").insert({"user_id": user_id, **task}).execute()


def seed_checkins_and_recommendations(client: Client, user_id: str) -> None:
  # From 7 days ago to today (8 entries).
  checkin_series = [
    {"energy": 7, "focus": 7, "stress": 4, "sleep_quality": 7, "motivation": 7, "available_time_minutes": 120},
    {"energy": 6, "focus": 6, "stress": 5, "sleep_quality": 6, "motivation": 6, "available_time_minutes": 90},
    {"energy": 4, "focus": 4, "stress": 7, "sleep_quality": 4, "motivation": 4, "available_time_minutes": 60},
    {"energy": 3, "focus": 4, "stress": 8, "sleep_quality": 4, "motivation": 3, "available_time_minutes": 45},
    {"energy": 4, "focus": 3, "stress": 7, "sleep_quality": 4, "motivation": 4, "available_time_minutes": 45},
    {"energy": 3, "focus": 3, "stress": 8, "sleep_quality": 3, "motivation": 3, "available_time_minutes": 30},
    {"energy": 5, "focus": 5, "stress": 6, "sleep_quality": 5, "motivation": 5, "available_time_minutes": 60},
    {"energy": 6, "focus": 6, "stress": 5, "sleep_quality": 6, "motivation": 6, "available_time_minutes": 90},
  ]

  recommendations = [
    {"task": "Solve 15 SQL exercises (JOIN, GROUP BY)", "mode": "deep", "recovery": False},
    {"task": "Summarize scheduler algorithms", "mode": "normal", "recovery": False},
    {"task": "Review database notes for 30 minutes", "mode": "light", "recovery": False},
    {"task": "Review database notes for 30 minutes", "mode": "recovery", "recovery": True},
    {"task": "Review database notes for 30 minutes", "mode": "recovery", "recovery": True},
    {"task": "Recovery action only: choose one light review or rest routine", "mode": "recovery", "recovery": True},
    {"task": "Review database notes for 30 minutes", "mode": "light", "recovery": False},
    {"task": "Summarize scheduler algorithms", "mode": "normal", "recovery": False},
  ]

  for offset, checkin_values in enumerate(checkin_series):
    checkin_date = (date.today() - timedelta(days=(7 - offset))).isoformat()

    checkin_payload = {
      "user_id": user_id,
      "checkin_date": checkin_date,
      **checkin_values,
    }

    client.table("daily_checkins").upsert(checkin_payload, on_conflict="user_id,checkin_date").execute()
    checkin_row = (
      client.table("daily_checkins")
      .select("id")
      .eq("user_id", user_id)
      .eq("checkin_date", checkin_date)
      .limit(1)
      .execute()
      .data[0]
    )

    rec = recommendations[offset]
    rec_payload = {
      "user_id": user_id,
      "checkin_id": checkin_row["id"],
      "recommendation_date": checkin_date,
      "recommended_task": rec["task"],
      "recommended_mode": rec["mode"],
      "explanation": "Demo recommendation generated from rule-based logic and AI explanation.",
      "avoid_text": "Avoid overloading your schedule and switching tasks too often.",
      "recovery_alert": rec["recovery"],
      "recovery_actions": [
        "Choose one light task only",
        "Take a short walk",
        "Sleep earlier tonight",
      ]
      if rec["recovery"]
      else [],
    }

    client.table("daily_recommendations").upsert(rec_payload, on_conflict="user_id,recommendation_date").execute()


def main() -> None:
  client = get_client()
  user_id = detect_user_id(client)
  goals = ensure_demo_goals(client, user_id)
  ensure_demo_tasks(client, user_id, goals)
  seed_checkins_and_recommendations(client, user_id)
  print("Demo data inserted for user:", user_id)


if __name__ == "__main__":
  main()
