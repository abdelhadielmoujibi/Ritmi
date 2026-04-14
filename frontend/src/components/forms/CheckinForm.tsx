"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { MetricSlider } from "@/components/checkin/MetricSlider";
import { generateAndSaveRecommendationFromCheckin } from "@/lib/api/backend";
import { createClient } from "@/lib/supabase/client";
import { DailyCheckinInput } from "@/types/domain";

const timeOptions = [
  { label: "30 min", value: 30 },
  { label: "1h", value: 60 },
  { label: "2h", value: 120 },
  { label: "3h+", value: 180 },
];

function buildTimeGuidance(minutes: number) {
  if (minutes <= 30) return "Keep scope minimal: one light task and stop.";
  if (minutes <= 60) return "Choose one focused task, avoid multitasking.";
  if (minutes <= 120) return "Good capacity for one meaningful medium block.";
  return "High capacity window. Use breaks and protect deep focus.";
}

const defaultValues: DailyCheckinInput = {
  energy: 6,
  focus: 6,
  stress: 5,
  sleep_quality: 6,
  motivation: 6,
  available_time_minutes: 60,
};

function getLocalDateISO() {
  const now = new Date();
  const tzOffsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

function validate(values: DailyCheckinInput) {
  const errors: string[] = [];
  const metrics = [values.energy, values.focus, values.stress, values.sleep_quality, values.motivation];

  if (metrics.some((metric) => Number.isNaN(metric) || metric < 1 || metric > 10)) {
    errors.push("All check-in scores must be between 1 and 10.");
  }

  if (!values.available_time_minutes || values.available_time_minutes <= 0) {
    errors.push("Please choose your available study time.");
  }

  return errors;
}

export function CheckinForm() {
  const supabase = useMemo(() => createClient(), []);
  const [values, setValues] = useState<DailyCheckinInput>(defaultValues);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [loadingToday, setLoadingToday] = useState(true);

  useEffect(() => {
    const loadToday = async () => {
      setLoadingToday(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrors(["No authenticated user found."]);
        setLoadingToday(false);
        return;
      }

      const today = getLocalDateISO();

      const { data, error } = await supabase
        .from("daily_checkins")
        .select("energy,focus,stress,sleep_quality,motivation,available_time_minutes")
        .eq("checkin_date", today)
        .maybeSingle();

      if (error) {
        setErrors([error.message]);
      } else if (data) {
        setValues({
          energy: data.energy,
          focus: data.focus,
          stress: data.stress,
          sleep_quality: data.sleep_quality,
          motivation: data.motivation,
          available_time_minutes: data.available_time_minutes,
        });
        setSubmittedMessage("Today check-in already exists. You can update it and submit again.");
      }

      setLoadingToday(false);
    };

    void loadToday();
  }, [supabase]);

  const average = useMemo(() => {
    const total = values.energy + values.focus + values.sleep_quality + values.motivation + (11 - values.stress);
    return (total / 5).toFixed(1);
  }, [values]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedMessage(null);

    const formErrors = validate(values);
    if (formErrors.length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors([]);
    setSubmitting(true);

    try {
      const today = getLocalDateISO();

      // Preferred flow: save check-in + generate + save recommendation in backend.
      try {
        await generateAndSaveRecommendationFromCheckin({
          checkin_date: today,
          energy: values.energy,
          focus: values.focus,
          stress: values.stress,
          sleep_quality: values.sleep_quality,
          motivation: values.motivation,
          available_time_minutes: values.available_time_minutes,
        });
        setSubmittedMessage("Check-in saved and recommendation generated. Open the Recommendation tab to review it.");
        return;
      } catch (backendError) {
        // Fallback flow: save check-in directly if backend is unavailable.
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setErrors(["No authenticated user found."]);
          return;
        }

        const payload = {
          user_id: user.id,
          checkin_date: today,
          energy: values.energy,
          focus: values.focus,
          stress: values.stress,
          sleep_quality: values.sleep_quality,
          motivation: values.motivation,
          available_time_minutes: values.available_time_minutes,
        };

        const { error: insertError } = await supabase.from("daily_checkins").insert(payload);

        if (!insertError) {
          setSubmittedMessage(
            `Check-in saved, but recommendation generation failed (${backendError instanceof Error ? backendError.message : "unknown error"}). Make sure backend is running and env is configured, then submit again.`,
          );
          return;
        }

        if (insertError.code === "23505") {
          const { error: updateError } = await supabase
            .from("daily_checkins")
            .update({
              energy: values.energy,
              focus: values.focus,
              stress: values.stress,
              sleep_quality: values.sleep_quality,
              motivation: values.motivation,
              available_time_minutes: values.available_time_minutes,
            })
            .eq("user_id", user.id)
            .eq("checkin_date", today);

          if (updateError) {
            setErrors([updateError.message]);
            return;
          }

          setSubmittedMessage(`Check-in updated, but recommendation generation failed (${backendError instanceof Error ? backendError.message : "unknown error"}). Start backend and submit again to create recommendation.`);
          return;
        }

        setErrors([
          backendError instanceof Error
            ? `Recommendation backend failed: ${backendError.message}`
            : "Recommendation backend failed and check-in fallback also failed.",
        ]);
        return;
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingToday) {
    return (
      <div className="rounded-xl border border-zinc-700 bg-zinc-950/60 p-4 text-sm text-zinc-300">
        Loading today check-in...
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <MetricSlider
          id="energy"
          label="Energy level"
          hint="How physically and mentally energized do you feel?"
          value={values.energy}
          onChange={(next) => setValues((prev) => ({ ...prev, energy: next }))}
        />

        <MetricSlider
          id="focus"
          label="Focus level"
          hint="How easy is it to concentrate right now?"
          value={values.focus}
          onChange={(next) => setValues((prev) => ({ ...prev, focus: next }))}
        />

        <MetricSlider
          id="stress"
          label="Stress level"
          hint="Higher means more pressure today."
          value={values.stress}
          inverse
          onChange={(next) => setValues((prev) => ({ ...prev, stress: next }))}
        />

        <MetricSlider
          id="sleep_quality"
          label="Sleep quality"
          hint="How restorative was your sleep?"
          value={values.sleep_quality}
          onChange={(next) => setValues((prev) => ({ ...prev, sleep_quality: next }))}
        />

        <MetricSlider
          id="motivation"
          label="Motivation level"
          hint="How ready are you to start study work?"
          value={values.motivation}
          onChange={(next) => setValues((prev) => ({ ...prev, motivation: next }))}
        />

        <section className="rounded-xl border border-zinc-700 bg-zinc-950/70 p-4">
          <p className="text-sm font-semibold text-zinc-100">Available study time</p>
          <p className="text-xs text-zinc-400">Choose a realistic block for today.</p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {timeOptions.map((option) => {
              const active = values.available_time_minutes === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValues((prev) => ({ ...prev, available_time_minutes: option.value }))}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "border-amber-300/40 bg-amber-300/15 text-amber-200"
                      : "border-zinc-600 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <label className="mt-3 grid gap-1 text-xs text-zinc-400">
            Custom minutes (optional)
            <input
              type="number"
              min={15}
              step={15}
              value={values.available_time_minutes}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  available_time_minutes: Math.max(15, Number(event.target.value) || 15),
                }))
              }
              className="rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
            />
          </label>

          <p className="mt-2 text-xs text-zinc-400">{buildTimeGuidance(values.available_time_minutes)}</p>

          <div className="mt-4 rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-3 text-xs text-emerald-200">
            Readiness score: {average}/10 (supportive indicator only)
          </div>
        </section>
      </div>

      {errors.length > 0 ? (
        <div className="rounded-lg border border-rose-300/35 bg-rose-300/10 p-3 text-sm text-rose-200">
          {errors.map((error) => (
            <p key={error}>- {error}</p>
          ))}
        </div>
      ) : null}

      {submittedMessage ? <p className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-3 text-sm text-emerald-200">{submittedMessage}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-amber-300 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-amber-200 disabled:opacity-60"
        >
          {submitting ? "Saving check-in..." : "Submit daily check-in"}
        </button>
        <p className="text-xs text-zinc-400">Keep it honest and practical. The goal is a realistic plan for today.</p>
      </div>
    </form>
  );
}
