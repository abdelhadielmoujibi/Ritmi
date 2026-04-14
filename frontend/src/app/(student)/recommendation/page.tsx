"use client";

import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";

import { RecommendationResultView } from "@/components/recommendation/RecommendationResultView";
import { fetchHistory, fetchLatestRecommendation, generateAndSaveRecommendationFromCheckin } from "@/lib/api/backend";
import { RecommendationResult } from "@/types/domain";

function todayIso() {
  const now = new Date();
  const tzOffsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

export default function RecommendationPage() {
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = await fetchLatestRecommendation();

      // If no recommendation exists yet but today's check-in exists,
      // auto-generate recommendation from that check-in.
      const today = todayIso();
      const hasTodayRecommendation = data?.recommendation_date === today;

      if (!hasTodayRecommendation) {
        const history = await fetchHistory(7);
        const todayCheckin = history.checkins.find((item) => item.checkin_date === today);

        if (todayCheckin) {
          await generateAndSaveRecommendationFromCheckin({
            checkin_date: todayCheckin.checkin_date,
            energy: todayCheckin.energy,
            focus: todayCheckin.focus,
            stress: todayCheckin.stress,
            sleep_quality: todayCheckin.sleep_quality,
            motivation: todayCheckin.motivation,
            available_time_minutes: todayCheckin.available_time_minutes,
          });

          data = await fetchLatestRecommendation();
        }
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load recommendation result");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8">
      <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Recommendation Result</h1>
            <p className="mt-2 text-sm text-zinc-300">
              Your adaptive study direction for today, generated from check-in signals, task priorities, and recovery rules.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800 disabled:opacity-60"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </section>

      <RecommendationResultView result={result} loading={loading} error={error} />
    </main>
  );
}
