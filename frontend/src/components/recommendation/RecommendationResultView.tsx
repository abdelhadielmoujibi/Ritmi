"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";

import { RecommendationResult } from "@/types/domain";

type RecommendationResultViewProps = {
  result: RecommendationResult | null;
  loading: boolean;
  error: string | null;
};

function modeStyle(mode: RecommendationResult["recommended_mode"]) {
  if (mode === "deep") return "bg-fuchsia-300/15 text-fuchsia-200 border-fuchsia-300/30";
  if (mode === "normal") return "bg-sky-300/15 text-sky-200 border-sky-300/30";
  if (mode === "light") return "bg-emerald-300/15 text-emerald-200 border-emerald-300/30";
  return "bg-amber-300/15 text-amber-200 border-amber-300/30";
}

export function RecommendationResultView({ result, loading, error }: RecommendationResultViewProps) {
  if (loading) {
    return (
      <div className="grid gap-4">
        <section className="h-36 animate-pulse rounded-2xl border border-zinc-700 bg-zinc-900/70 p-6 shadow-sm" />
        <section className="grid gap-4 md:grid-cols-2">
          <article className="h-32 animate-pulse rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5" />
          <article className="h-32 animate-pulse rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5" />
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-rose-300/35 bg-rose-300/10 p-6 shadow-sm">
        <p className="text-sm text-rose-200">{error}</p>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-white">No recommendation yet</h2>
        <p className="mt-2 text-sm text-zinc-300">Complete today's check-in to generate your personalized recommendation result.</p>
        <Link href="/checkin" className="mt-4 inline-flex rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200">
          Complete daily check-in
        </Link>
      </section>
    );
  }

  const explanation = result.short_explanation || result.explanation || "Recommendation generated from your current daily state.";
  const recommendationText =
    result.supportive_recommendation ||
    `Today's best action: ${result.recommended_task}. Keep it practical and focus on one meaningful win.`;

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-200">Today recommendation</p>
        <h2 className="mt-2 text-3xl font-bold text-white">{result.recommended_task}</h2>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${modeStyle(result.recommended_mode)}`}>
            Mode: {result.recommended_mode}
          </span>
          {result.recovery_alert ? (
            <span className="rounded-full border border-amber-300/30 bg-amber-300/15 px-3 py-1 text-xs font-semibold text-amber-200">
              Recovery alert active
            </span>
          ) : (
            <span className="rounded-full border border-emerald-300/30 bg-emerald-300/15 px-3 py-1 text-xs font-semibold text-emerald-200">
              Regular mode
            </span>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5">
          <div className="mb-2 flex items-center gap-2 text-amber-200">
            <Sparkles className="h-4 w-4" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">AI explanation</h3>
          </div>
          <p className="text-sm text-zinc-200">{explanation}</p>
          <p className="mt-3 text-sm text-zinc-300">{recommendationText}</p>
        </article>

        <article className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5">
          <div className="mb-2 flex items-center gap-2 text-rose-200">
            <AlertTriangle className="h-4 w-4" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">What to avoid today</h3>
          </div>
          <p className="text-sm text-zinc-200">{result.avoid_text}</p>
        </article>
      </section>

      {result.recovery_alert ? (
        <section className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5">
          <h3 className="text-base font-semibold text-amber-100">Recovery guidance</h3>
          <p className="mt-2 text-sm text-amber-100/90">
            Keep today intentionally lighter. The goal is to protect consistency, then rebuild momentum.
          </p>

          <div className="mt-4 grid gap-2">
            {(result.recovery_actions || []).slice(0, 4).map((action) => (
              <div key={action} className="flex items-start gap-2 rounded-lg border border-amber-300/25 bg-zinc-950/40 p-3 text-sm text-zinc-100">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
                <span>{action}</span>
              </div>
            ))}
            {result.recovery_actions.length === 0 ? (
              <div className="rounded-lg border border-amber-300/25 bg-zinc-950/40 p-3 text-sm text-zinc-100">
                Choose one light task only, take a short break, and stop early.
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
