import { createClient } from "@/lib/supabase/client";
import { DailyCheckinHistory, DashboardSummary, HistoryBundle, RecommendationResult } from "@/types/domain";
import { DailyCheckinInput } from "@/types/domain";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type HistoryResponse = {
  checkins: Array<Record<string, unknown>>;
  recommendations: Array<Record<string, unknown>>;
};

type DashboardResponse = {
  counts: {
    monthly_goals: number;
    weekly_tasks_total: number;
    weekly_tasks_pending: number;
    weekly_tasks_completed: number;
  };
  last_checkin: Record<string, unknown> | null;
  today_recommendation: Record<string, unknown> | null;
};

async function getAuthHeaders() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No active session token found");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
    ...(user?.id ? { "X-User-Id": user.id } : {}),
  };
}

function mapRecommendationRow(row: Record<string, unknown>): RecommendationResult {
  return {
    id: String(row.id ?? ""),
    recommendation_date: String(row.recommendation_date ?? ""),
    recommended_task: String(row.recommended_task ?? ""),
    recommended_mode: String(row.recommended_mode ?? "light") as RecommendationResult["recommended_mode"],
    explanation: String(row.explanation ?? ""),
    avoid_text: String(row.avoid_text ?? "Avoid overloading your day."),
    recovery_alert: Boolean(row.recovery_alert),
    recovery_actions: Array.isArray(row.recovery_actions) ? row.recovery_actions.map((item) => String(item)) : [],
  };
}

function mapCheckinRow(row: Record<string, unknown>): DailyCheckinHistory {
  return {
    id: String(row.id ?? ""),
    checkin_date: String(row.checkin_date ?? ""),
    energy: Number(row.energy ?? 0),
    focus: Number(row.focus ?? 0),
    stress: Number(row.stress ?? 0),
    sleep_quality: Number(row.sleep_quality ?? 0),
    motivation: Number(row.motivation ?? 0),
    available_time_minutes: Number(row.available_time_minutes ?? 0),
  };
}

export async function fetchLatestRecommendation(): Promise<RecommendationResult | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/v1/history?limit=1`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch history (${response.status})`);
    }

    const payload = (await response.json()) as HistoryResponse;
    const latest = payload.recommendations?.[0];
    if (!latest) {
      return null;
    }

    return mapRecommendationRow(latest);
  } catch (error) {
    console.error("fetchLatestRecommendation failed:", error);
    return null;
  }
}

export async function fetchHistory(limit = 21): Promise<HistoryBundle> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/v1/history?limit=${limit}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch history (${response.status})`);
  }

  const payload = (await response.json()) as HistoryResponse;

  return {
    checkins: (payload.checkins ?? []).map((row) => mapCheckinRow(row)),
    recommendations: (payload.recommendations ?? []).map((row) => mapRecommendationRow(row)),
  };
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/v1/dashboard`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard (${response.status})`);
  }

  const payload = (await response.json()) as DashboardResponse;

  return {
    counts: {
      monthly_goals: Number(payload.counts?.monthly_goals ?? 0),
      weekly_tasks_total: Number(payload.counts?.weekly_tasks_total ?? 0),
      weekly_tasks_pending: Number(payload.counts?.weekly_tasks_pending ?? 0),
      weekly_tasks_completed: Number(payload.counts?.weekly_tasks_completed ?? 0),
    },
    last_checkin: payload.last_checkin ? mapCheckinRow(payload.last_checkin) : null,
    today_recommendation: payload.today_recommendation ? mapRecommendationRow(payload.today_recommendation) : null,
  };
}

export async function generateAndSaveRecommendationFromCheckin(checkin: DailyCheckinInput & { checkin_date?: string }) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/api/v1/recommendations/generate-and-save`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      current_checkin: checkin,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to generate recommendation (${response.status}): ${text}`);
  }

  return response.json();
}
