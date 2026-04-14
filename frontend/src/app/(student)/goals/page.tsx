"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { GoalForm } from "@/components/forms/GoalForm";
import { GoalList } from "@/components/goals/GoalList";
import { createClient } from "@/lib/supabase/client";
import { GoalFormValues, MonthlyGoal } from "@/types/db";

export default function GoalsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [goals, setGoals] = useState<MonthlyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<MonthlyGoal | null>(null);

  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Unable to load user session.");
      setLoading(false);
      return;
    }

    const { data, error: goalsError } = await supabase
      .from("monthly_goals")
      .select("id,user_id,title,description,priority,created_at,updated_at")
      .order("created_at", { ascending: false });

    if (goalsError) {
      setError(goalsError.message);
    } else {
      setGoals((data ?? []) as MonthlyGoal[]);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadGoals();
  }, [loadGoals]);

  const saveGoal = async (values: GoalFormValues) => {
    setSaving(true);
    setError(null);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("No authenticated user.");
      setSaving(false);
      return;
    }

    const payload = {
      user_id: user.id,
      title: values.title.trim(),
      description: values.description.trim() || null,
      priority: values.priority,
    };

    if (editingGoal) {
      const { data, error: updateError } = await supabase
        .from("monthly_goals")
        .update(payload)
        .eq("id", editingGoal.id)
        .select("id,user_id,title,description,priority,created_at,updated_at")
        .single();

      if (updateError) {
        setError(updateError.message);
      } else {
        setGoals((prev) => prev.map((goal) => (goal.id === editingGoal.id ? (data as MonthlyGoal) : goal)));
        setEditingGoal(null);
      }

      setSaving(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("monthly_goals")
      .insert(payload)
      .select("id,user_id,title,description,priority,created_at,updated_at")
      .single();

    if (insertError) {
      setError(insertError.message);
    } else {
      setGoals((prev) => [data as MonthlyGoal, ...prev]);
    }

    setSaving(false);
  };

  const deleteGoal = async (goalId: string) => {
    setError(null);
    const { error: deleteError } = await supabase.from("monthly_goals").delete().eq("id", goalId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    if (editingGoal?.id === goalId) {
      setEditingGoal(null);
    }
  };

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8">
      <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm backdrop-blur">
        <h1 className="text-2xl font-bold text-white">Monthly Goals</h1>
        <p className="mt-2 text-sm text-zinc-300">Create your monthly goals first. Weekly tasks are linked to these goals.</p>
      </section>

      {error ? <p className="rounded-xl border border-rose-300/35 bg-rose-300/10 p-3 text-sm text-rose-200">{error}</p> : null}

      {loading ? (
        <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-6 shadow-sm backdrop-blur">
          <p className="text-sm text-zinc-300">Loading goals...</p>
        </section>
      ) : (
        <>
          <GoalForm initialGoal={editingGoal} loading={saving} onSubmit={saveGoal} onCancelEdit={() => setEditingGoal(null)} />
          <GoalList goals={goals} onEdit={setEditingGoal} onDelete={deleteGoal} />
        </>
      )}
    </main>
  );
}
