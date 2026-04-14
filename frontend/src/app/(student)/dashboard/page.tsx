"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, ListChecks, Target } from "lucide-react";

import { MiniTrendCard } from "@/components/dashboard/MiniTrendCard";
import { fetchDashboardSummary, fetchHistory } from "@/lib/api/backend";
import { DailyCheckinHistory } from "@/types/domain";
import { DashboardSummary } from "@/types/domain";

function StatCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <article className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
    </article>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<DailyCheckinHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const todayIso = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  const isNegativeDay = (checkin: DailyCheckinHistory) => {
    let bad = 0;
    bad += Number(checkin.energy <= 4);
    bad += Number(checkin.focus <= 4);
    bad += Number(checkin.stress >= 7);
    bad += Number(checkin.sleep_quality <= 4);
    bad += Number(checkin.motivation <= 4);
    return bad >= 3;
  };

  const streakCount = () => {
    const ordered = [...recentCheckins].sort((a, b) => a.checkin_date.localeCompare(b.checkin_date));
    let streak = 0;
    for (let i = ordered.length - 1; i >= 0; i -= 1) {
      if (isNegativeDay(ordered[i])) streak += 1;
      else break;
    }
    return streak;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dashboard, history] = await Promise.all([fetchDashboardSummary(), fetchHistory(7)]);
        setSummary(dashboard);
        setRecentCheckins(history.checkins);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const currentStreak = streakCount();
  const checkedInToday = recentCheckins.some((item) => item.checkin_date === todayIso);

  const reminderText = currentStreak >= 3
    ? "Your recent pattern looks heavy. Keep today light and focus on one manageable action."
    : !checkedInToday
      ? "You have not checked in today yet. A 60-second check-in unlocks your best-fit recommendation."
      : (summary?.today_recommendation
          ? "Great consistency. Follow today recommendation and avoid overloading your schedule."
          : "You checked in, now generate and review your recommendation result.");

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-8">
      <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-200">Student Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Your adaptive study cockpit</h1>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              currentStreak >= 4
                ? "border-rose-300/35 bg-rose-300/15 text-rose-200"
                : currentStreak >= 2
                  ? "border-amber-300/35 bg-amber-300/15 text-amber-200"
                  : "border-emerald-300/35 bg-emerald-300/15 text-emerald-200"
            }`}
          >
            {currentStreak > 0 ? `${currentStreak}-day streak watch` : "Stable streak"}
          </span>
        </div>
        <p className="mt-3 max-w-3xl text-zinc-300">
          Track your consistency, keep tasks realistic, and get today recommendation aligned with your real condition.
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-4 shadow-sm">
        <p className="text-sm text-zinc-200">{reminderText}</p>
      </section>

      {error ? <p className="rounded-xl border border-rose-300/35 bg-rose-300/10 p-3 text-sm text-rose-200">{error}</p> : null}

      {loading ? (
        <section className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl border border-zinc-700 bg-zinc-900/70" />
          ))}
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Monthly goals" value={summary?.counts.monthly_goals ?? 0} tone="text-amber-200" />
          <StatCard label="Weekly tasks" value={summary?.counts.weekly_tasks_total ?? 0} tone="text-sky-200" />
          <StatCard label="Pending tasks" value={summary?.counts.weekly_tasks_pending ?? 0} tone="text-fuchsia-200" />
          <StatCard label="Completed tasks" value={summary?.counts.weekly_tasks_completed ?? 0} tone="text-emerald-200" />
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-amber-200">
            <Target className="h-4 w-4" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em]">Today recommendation</h2>
          </div>
          {loading ? (
            <div className="h-20 animate-pulse rounded-lg bg-zinc-800" />
          ) : summary?.today_recommendation ? (
            <>
              <p className="text-lg font-semibold text-white">{summary.today_recommendation.recommended_task}</p>
              <p className="mt-2 text-sm text-zinc-300">Mode: {summary.today_recommendation.recommended_mode}</p>
              <Link href="/recommendation" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-200 hover:text-amber-100">
                Open full recommendation <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-zinc-300">No recommendation generated yet for today.</p>
              <Link href="/checkin" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200">
                Complete daily check-in
              </Link>
            </>
          )}
        </article>

        <article className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em]">Last check-in</h2>
          </div>
          {loading ? (
            <div className="h-20 animate-pulse rounded-lg bg-zinc-800" />
          ) : summary?.last_checkin ? (
            <div className="grid grid-cols-2 gap-2 text-sm text-zinc-200">
              <span>Energy: {summary.last_checkin.energy}</span>
              <span>Focus: {summary.last_checkin.focus}</span>
              <span>Stress: {summary.last_checkin.stress}</span>
              <span>Sleep: {summary.last_checkin.sleep_quality}</span>
              <span>Motivation: {summary.last_checkin.motivation}</span>
              <span>Time: {summary.last_checkin.available_time_minutes}m</span>
            </div>
          ) : (
            <p className="text-sm text-zinc-300">No check-in data yet. Start with your first daily check-in.</p>
          )}
        </article>
      </section>

      <MiniTrendCard checkins={recentCheckins} />

      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/goals" className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300/50">
          <h2 className="text-lg font-semibold text-white">Monthly Goals</h2>
          <p className="mt-2 text-sm text-zinc-300">Define 2-4 high-impact goals for the month.</p>
        </Link>

        <Link href="/tasks" className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300/50">
          <h2 className="text-lg font-semibold text-white">Weekly Tasks</h2>
          <p className="mt-2 text-sm text-zinc-300">Plan tasks by priority, difficulty, and deadline.</p>
        </Link>

        <Link href="/history" className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300/50">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-amber-200" />
            <h2 className="text-lg font-semibold text-white">History & Trends</h2>
          </div>
          <p className="mt-2 text-sm text-zinc-300">Review consistency, streaks, and recommendation history.</p>
        </Link>
      </section>
    </main>
  );
}
