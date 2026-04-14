"use client";

import { useEffect, useMemo, useState } from "react";

import { TrendChart } from "@/components/history/TrendChart";
import { fetchHistory } from "@/lib/api/backend";
import { DailyCheckinHistory, RecommendationResult } from "@/types/domain";

function isNegativeDay(checkin: DailyCheckinHistory) {
  let badSignals = 0;
  badSignals += Number(checkin.energy <= 4);
  badSignals += Number(checkin.focus <= 4);
  badSignals += Number(checkin.stress >= 7);
  badSignals += Number(checkin.sleep_quality <= 4);
  badSignals += Number(checkin.motivation <= 4);
  return badSignals >= 3;
}

function negativeStreakCount(checkins: DailyCheckinHistory[]) {
  const ordered = [...checkins].sort((a, b) => a.checkin_date.localeCompare(b.checkin_date));
  let streak = 0;
  for (let i = ordered.length - 1; i >= 0; i -= 1) {
    if (isNegativeDay(ordered[i])) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

export default function HistoryPage() {
  const [checkins, setCheckins] = useState<DailyCheckinHistory[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchHistory(21);
        setCheckins(data.checkins);
        setRecommendations(data.recommendations);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load history");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const streak = useMemo(() => negativeStreakCount(checkins), [checkins]);

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8">
      <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm backdrop-blur">
        <h1 className="text-2xl font-bold text-white">History & Trends</h1>
        <p className="mt-2 text-sm text-zinc-300">Track your recent check-ins, recommendation outcomes, and early signs of negative streaks.</p>
      </section>

      {error ? <p className="rounded-xl border border-rose-300/35 bg-rose-300/10 p-3 text-sm text-rose-200">{error}</p> : null}

      {loading ? (
        <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-6 shadow-sm">
          <p className="text-sm text-zinc-300">Loading history...</p>
        </section>
      ) : (
        <>
          {streak >= 2 ? (
            <section className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-amber-100">Negative streak watch</h2>
              <p className="mt-2 text-sm text-amber-100/90">
                Current consecutive negative days: <span className="font-semibold">{streak}</span>
                {streak >= 4 ? " (Recovery mode should be active)." : " (Monitor closely and keep workload realistic)."}
              </p>
            </section>
          ) : null}

          <TrendChart checkins={checkins} />

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-white">Recent Daily Check-ins</h2>
              {checkins.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-300">No check-ins yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {checkins.slice(0, 8).map((item) => (
                    <div key={item.id ?? item.checkin_date} className="rounded-lg border border-zinc-700 bg-zinc-950/60 p-3 text-sm text-zinc-200">
                      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-zinc-400">{item.checkin_date}</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <span>Energy: {item.energy}</span>
                        <span>Focus: {item.focus}</span>
                        <span>Stress: {item.stress}</span>
                        <span>Sleep: {item.sleep_quality}</span>
                        <span>Motivation: {item.motivation}</span>
                        <span>Time: {item.available_time_minutes}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-white">Previous Recommendations</h2>
              {recommendations.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-300">No recommendation history yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {recommendations.slice(0, 8).map((item) => (
                    <div key={item.id ?? `${item.recommendation_date}-${item.recommended_task}`} className="rounded-lg border border-zinc-700 bg-zinc-950/60 p-3 text-sm text-zinc-200">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-xs uppercase tracking-[0.12em] text-zinc-400">{item.recommendation_date || "date"}</span>
                        <span className="rounded-full border border-amber-300/30 bg-amber-300/15 px-2 py-0.5 text-xs text-amber-200">{item.recommended_mode}</span>
                      </div>
                      <p className="font-medium text-white">{item.recommended_task}</p>
                      <p className="mt-1 text-xs text-zinc-400">Avoid: {item.avoid_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </main>
  );
}
