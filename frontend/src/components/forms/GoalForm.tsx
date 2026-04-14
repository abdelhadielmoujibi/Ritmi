"use client";

import { FormEvent, useEffect, useState } from "react";

import { GoalFormValues, MonthlyGoal } from "@/types/db";

type GoalFormProps = {
  initialGoal?: MonthlyGoal | null;
  loading?: boolean;
  onSubmit: (values: GoalFormValues) => Promise<void>;
  onCancelEdit?: () => void;
};

const defaultValues: GoalFormValues = {
  title: "",
  description: "",
  priority: "medium",
};

export function GoalForm({ initialGoal, loading = false, onSubmit, onCancelEdit }: GoalFormProps) {
  const [values, setValues] = useState<GoalFormValues>(defaultValues);

  useEffect(() => {
    if (!initialGoal) {
      setValues(defaultValues);
      return;
    }

    setValues({
      title: initialGoal.title,
      description: initialGoal.description ?? "",
      priority: initialGoal.priority ?? "medium",
    });
  }, [initialGoal]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
    if (!initialGoal) {
      setValues(defaultValues);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-white">{initialGoal ? "Edit Monthly Goal" : "Create Monthly Goal"}</h2>
        {initialGoal && onCancelEdit ? (
          <button type="button" onClick={onCancelEdit} className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-100 hover:bg-zinc-800">
            Cancel edit
          </button>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm text-zinc-300 md:col-span-2">
          Title
          <input
            value={values.title}
            onChange={(e) => setValues((prev) => ({ ...prev, title: e.target.value }))}
            className="rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-zinc-100"
            placeholder="Ex: Finish chapter 3 in mathematics"
            required
            disabled={loading}
          />
        </label>

        <label className="grid gap-1 text-sm text-zinc-300 md:col-span-2">
          Description (optional)
          <textarea
            value={values.description}
            onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
            className="min-h-24 rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-zinc-100"
            placeholder="Short detail about this monthly goal"
            disabled={loading}
          />
        </label>

        <label className="grid gap-1 text-sm text-zinc-300">
          Priority
          <select
            value={values.priority}
            onChange={(e) => setValues((prev) => ({ ...prev, priority: e.target.value as GoalFormValues["priority"] }))}
            className="rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-zinc-100"
            disabled={loading}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-amber-300 px-4 py-2 font-semibold text-zinc-950 hover:bg-amber-200 disabled:opacity-60"
          >
            {loading ? "Saving..." : initialGoal ? "Update goal" : "Create goal"}
          </button>
        </div>
      </form>
    </section>
  );
}
