def classify_day_state(checkin: dict | object, recovery_mode: bool) -> tuple[str, list[str]]:
  """
  Classifies the student's current day into one of:
  - strong day
  - normal day
  - low-energy day
  - recovery-needed day
  """
  if isinstance(checkin, dict):
    energy = int(checkin.get("energy", 0))
    focus = int(checkin.get("focus", 0))
    stress = int(checkin.get("stress", 0))
    sleep_quality = int(checkin.get("sleep_quality", 0))
    motivation = int(checkin.get("motivation", 0))
    available_time_minutes = int(checkin.get("available_time_minutes", 0))
  else:
    energy = int(getattr(checkin, "energy", 0))
    focus = int(getattr(checkin, "focus", 0))
    stress = int(getattr(checkin, "stress", 0))
    sleep_quality = int(getattr(checkin, "sleep_quality", 0))
    motivation = int(getattr(checkin, "motivation", 0))
    available_time_minutes = int(getattr(checkin, "available_time_minutes", 0))

  reasons: list[str] = []

  if recovery_mode:
    reasons.append("4+ consecutive negative days detected")
    return "recovery-needed day", reasons

  strong_day = (
    energy >= 7
    and focus >= 7
    and motivation >= 7
    and sleep_quality >= 6
    and stress <= 5
    and available_time_minutes >= 90
  )

  if strong_day:
    reasons.append("high energy/focus/motivation with manageable stress")
    reasons.append("enough study time for deep work")
    return "strong day", reasons

  low_energy_day = (
    energy <= 4
    or focus <= 4
    or motivation <= 4
    or sleep_quality <= 4
    or stress >= 7
    or available_time_minutes <= 45
  )

  if low_energy_day:
    reasons.append("at least one low-capacity signal detected")
    if stress >= 7:
      reasons.append("high stress")
    if available_time_minutes <= 45:
      reasons.append("limited available study time")
    return "low-energy day", reasons

  reasons.append("balanced signals without overload")
  return "normal day", reasons


def choose_task_intensity(day_state: str) -> str:
  mapping = {
    "strong day": "hard",
    "normal day": "medium",
    "low-energy day": "light",
    "recovery-needed day": "recovery",
  }
  return mapping.get(day_state, "light")
