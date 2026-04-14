from datetime import datetime


NEGATIVE_LIMITS = {
  "energy_max": 4,
  "focus_max": 4,
  "stress_min": 7,
  "sleep_quality_max": 4,
  "motivation_max": 4,
}


def _value(checkin: dict | object, key: str) -> int | None:
  if isinstance(checkin, dict):
    return checkin.get(key)
  return getattr(checkin, key, None)


def _date_value(checkin: dict | object) -> str:
  if isinstance(checkin, dict):
    return str(checkin.get("checkin_date") or "")
  return str(getattr(checkin, "checkin_date", ""))


def count_negative_signals(checkin: dict | object) -> int:
  energy = _value(checkin, "energy")
  focus = _value(checkin, "focus")
  stress = _value(checkin, "stress")
  sleep_quality = _value(checkin, "sleep_quality")
  motivation = _value(checkin, "motivation")

  if None in (energy, focus, stress, sleep_quality, motivation):
    return 0

  bad_signals = 0
  bad_signals += int(energy <= NEGATIVE_LIMITS["energy_max"])
  bad_signals += int(focus <= NEGATIVE_LIMITS["focus_max"])
  bad_signals += int(stress >= NEGATIVE_LIMITS["stress_min"])
  bad_signals += int(sleep_quality <= NEGATIVE_LIMITS["sleep_quality_max"])
  bad_signals += int(motivation <= NEGATIVE_LIMITS["motivation_max"])
  return bad_signals


def is_negative_day(checkin: dict | object) -> bool:
  """
  MVP rule from context.md:
  day is negative when at least 3 bad indicators are present.
  """
  return count_negative_signals(checkin) >= 3


def negative_streak_count(checkins: list[dict | object]) -> int:
  """
  Counts consecutive negative days from the latest day backwards.
  """
  if not checkins:
    return 0

  sorted_checkins = sorted(
    checkins,
    key=lambda item: datetime.fromisoformat(_date_value(item)) if _date_value(item) else datetime.min,
  )

  streak = 0
  for checkin in reversed(sorted_checkins):
    if is_negative_day(checkin):
      streak += 1
    else:
      break
  return streak


def has_four_consecutive_negative_days(checkins: list[dict | object]) -> bool:
  """
  Recovery mode trigger for MVP:
  4 consecutive negative days.
  """
  return negative_streak_count(checkins) >= 4
