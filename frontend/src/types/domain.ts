export type DailyCheckinInput = {
  energy: number;
  focus: number;
  stress: number;
  sleep_quality: number;
  motivation: number;
  available_time_minutes: number;
};

export type WorkMode = "deep" | "normal" | "light" | "recovery";

export type DailyRecommendationOutput = {
  recommended_task: string;
  recommended_mode: WorkMode;
  explanation: string;
  avoid_text: string;
  recovery_alert: boolean;
  recovery_actions?: string[];
};

export type RecommendationResult = {
  id?: string;
  recommendation_date?: string;
  recommended_task: string;
  recommended_mode: WorkMode;
  short_explanation?: string;
  supportive_recommendation?: string;
  explanation?: string;
  avoid_text: string;
  recovery_alert: boolean;
  recovery_actions: string[];
  ai_source?: string;
};

export type DailyCheckinHistory = {
  id?: string;
  checkin_date: string;
  energy: number;
  focus: number;
  stress: number;
  sleep_quality: number;
  motivation: number;
  available_time_minutes: number;
};

export type HistoryBundle = {
  checkins: DailyCheckinHistory[];
  recommendations: RecommendationResult[];
};

export type DashboardSummary = {
  counts: {
    monthly_goals: number;
    weekly_tasks_total: number;
    weekly_tasks_pending: number;
    weekly_tasks_completed: number;
  };
  last_checkin: DailyCheckinHistory | null;
  today_recommendation: RecommendationResult | null;
};
