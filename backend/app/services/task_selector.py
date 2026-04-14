from datetime import date


PRIORITY_SCORE = {
  "high": 60,
  "medium": 35,
  "low": 10,
}

DIFFICULTY_FIT_SCORE = {
  "strong day": {"hard": 35, "medium": 20, "light": 8},
  "normal day": {"hard": 15, "medium": 30, "light": 18},
  "low-energy day": {"hard": -25, "medium": 12, "light": 35},
  "recovery-needed day": {"hard": -40, "medium": -20, "light": 30},
}


def _days_until(deadline_date: str | None) -> int | None:
  if not deadline_date:
    return None
  try:
    deadline = date.fromisoformat(deadline_date)
  except ValueError:
    return None
  return (deadline - date.today()).days


def _deadline_score(deadline_date: str | None) -> int:
  days_left = _days_until(deadline_date)
  if days_left is None:
    return 0
  if days_left < 0:
    return 45
  if days_left == 0:
    return 35
  if days_left == 1:
    return 30
  if days_left <= 3:
    return 20
  if days_left <= 7:
    return 10
  return 0


def _allowed_for_recovery(task: dict) -> bool:
  return task.get("difficulty") == "light"


def select_best_task_for_today(
  day_state: str,
  recovery_mode: bool,
  tasks: list[dict],
) -> tuple[dict | None, str, list[str]]:
  """
  Deterministic task selector for MVP.

  Returns:
    - selected task or None
    - recommended intensity
    - strategy notes
  """
  strategy_notes: list[str] = []

  pending_tasks = [task for task in tasks if task.get("status", "pending") == "pending"]
  if not pending_tasks:
    return None, "light", ["No pending weekly tasks found"]

  intensity_mapping = {
    "strong day": "hard",
    "normal day": "medium",
    "low-energy day": "light",
    "recovery-needed day": "recovery",
  }
  recommended_intensity = intensity_mapping.get(day_state, "light")

  candidate_tasks = pending_tasks
  if recovery_mode:
    light_only = [task for task in pending_tasks if _allowed_for_recovery(task)]
    if light_only:
      candidate_tasks = light_only
      strategy_notes.append("Recovery mode active: filtering to light tasks only")
    else:
      return None, "recovery", ["Recovery mode active and no light tasks available", "Recommend recovery action instead of demanding task"]

  # Day-state difficulty guardrails for transparent MVP behavior.
  if day_state == "low-energy day":
    light_only = [task for task in candidate_tasks if task.get("difficulty") == "light"]
    if light_only:
      candidate_tasks = light_only
      strategy_notes.append("Low-energy day: selecting from light tasks only")
    else:
      return None, "light", ["Low-energy day but no light pending tasks found", "Recommend one short recovery-friendly action instead"]

  if day_state == "normal day":
    non_hard = [task for task in candidate_tasks if task.get("difficulty") in {"light", "medium"}]
    if non_hard:
      candidate_tasks = non_hard
      strategy_notes.append("Normal day: prioritizing medium/light tasks")

  def score_task(task: dict) -> int:
    priority = task.get("priority", "low")
    difficulty = task.get("difficulty", "light")

    score = 0
    score += PRIORITY_SCORE.get(priority, 0)
    score += DIFFICULTY_FIT_SCORE.get(day_state, {}).get(difficulty, 0)
    score += _deadline_score(task.get("deadline_date"))

    return score

  scored = [(task, score_task(task)) for task in candidate_tasks]
  scored.sort(
    key=lambda item: (
      item[1],
      PRIORITY_SCORE.get(item[0].get("priority", "low"), 0),
      -(_days_until(item[0].get("deadline_date")) if _days_until(item[0].get("deadline_date")) is not None else 9999),
    ),
    reverse=True,
  )

  best_task, best_score = scored[0]
  strategy_notes.append(f"Selected by deterministic score: {best_score}")
  strategy_notes.append("Score = priority weight + difficulty fit + deadline urgency")

  return best_task, recommended_intensity, strategy_notes
