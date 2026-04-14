import json
import re
from typing import Any

from openai import OpenAI

from app.core.config import settings
from app.schemas.recommendation import AIRecommendationTextResponse, DailyRecommendationResultResponse


SYSTEM_PROMPT_TEMPLATE = """
You are StudyPulse AI writing assistant.
You generate concise, supportive, practical study guidance.

Rules:
- Never act as a therapist, doctor, or diagnostic tool.
- No medical claims, no clinical language.
- Keep tone calm, practical, and encouraging.
- Keep outputs short and clear for students.
- Return STRICT JSON only.

Required JSON keys:
- short_explanation (string, 1-2 sentences)
- supportive_recommendation (string, 1-2 sentences)
- avoid_text (string, 1 sentence)
- recovery_advice (array of strings, 0-4 items)
""".strip()


def _build_user_prompt(rule_result: DailyRecommendationResultResponse) -> str:
  return f"""
Generate the recommendation language for this decision:

recommended_task: {rule_result.recommended_task}
recommended_mode: {rule_result.recommended_mode}
recovery_alert: {str(rule_result.recovery_alert).lower()}
avoid_text: {rule_result.avoid_text}
internal_explanation_data: {json.dumps(rule_result.internal_explanation_data, ensure_ascii=True)}

Constraints:
- short_explanation must explain why this mode/task is chosen today.
- supportive_recommendation must be actionable and realistic for today.
- avoid_text should align with the provided avoid_text.
- recovery_advice should be provided only if recovery_alert=true; otherwise empty array.

Return JSON only.
""".strip()


def _extract_json(text: str) -> dict[str, Any] | None:
  try:
    return json.loads(text)
  except json.JSONDecodeError:
    pass

  match = re.search(r"\{[\s\S]*\}", text)
  if not match:
    return None

  try:
    return json.loads(match.group(0))
  except json.JSONDecodeError:
    return None


def _fallback(rule_result: DailyRecommendationResultResponse, reason: str) -> AIRecommendationTextResponse:
  mode = rule_result.recommended_mode
  if rule_result.recovery_alert:
    recovery_actions = [
      "Choose one light task only and stop when done",
      "Take a short walk or stretch break before studying",
      "Plan an earlier bedtime for tonight",
    ]
  else:
    recovery_actions = []

  explanation = (
    f"Today is classified as {mode} mode based on your check-in signals and recent pattern. "
    f"This recommendation is designed to protect consistency."
  )

  supportive = f"Recommended task: {rule_result.recommended_task}. Keep your workload realistic and complete one meaningful step today."

  return AIRecommendationTextResponse(
    short_explanation=explanation,
    supportive_recommendation=supportive,
    avoid_text=rule_result.avoid_text,
    recovery_advice=recovery_actions,
    ai_source=f"fallback:{reason}",
  )


def generate_ai_explanation(rule_result: DailyRecommendationResultResponse) -> AIRecommendationTextResponse:
  if not settings.openai_api_key:
    return _fallback(rule_result, "missing_openai_api_key")

  client = OpenAI(api_key=settings.openai_api_key, timeout=settings.openai_timeout_seconds)

  try:
    completion = client.chat.completions.create(
      model=settings.openai_model,
      temperature=0.2,
      response_format={"type": "json_object"},
      messages=[
        {"role": "system", "content": SYSTEM_PROMPT_TEMPLATE},
        {"role": "user", "content": _build_user_prompt(rule_result)},
      ],
    )

    raw_content = completion.choices[0].message.content or ""
    parsed = _extract_json(raw_content)
    if not parsed:
      return _fallback(rule_result, "json_parse_failed")

    try:
      model = AIRecommendationTextResponse(
        short_explanation=str(parsed.get("short_explanation", "")).strip(),
        supportive_recommendation=str(parsed.get("supportive_recommendation", "")).strip(),
        avoid_text=str(parsed.get("avoid_text", rule_result.avoid_text)).strip(),
        recovery_advice=[str(item).strip() for item in parsed.get("recovery_advice", []) if str(item).strip()],
        ai_source="openai",
      )
    except Exception:
      return _fallback(rule_result, "model_validation_failed")

    if not model.short_explanation or not model.supportive_recommendation:
      return _fallback(rule_result, "missing_required_fields")

    if not rule_result.recovery_alert:
      model.recovery_advice = []

    if not model.avoid_text:
      model.avoid_text = rule_result.avoid_text

    return model

  except Exception:
    return _fallback(rule_result, "openai_call_failed")
