"use client";

import { FormEvent, useEffect, useState } from "react";

import { MonthlyGoalLite, TaskFormValues, WeeklyTask } from "@/types/db";

type TaskFormProps = {
  goals: MonthlyGoalLite[];
  initialTask?: WeeklyTask | null;
  loading?: boolean;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onCancelEdit?: () => void;
};

const defaultValues: TaskFormValues = {
  goal_id: "",
  title: "",
  description: "",
  difficulty: "medium",
  priority: "medium",
  deadline_date: "",
  status: "pending",
};

export function TaskForm({ goals, initialTask, loading = false, onSubmit, onCancelEdit }: TaskFormProps) {
  const [values, setValues] = useState<TaskFormValues>(defaultValues);

  useEffect(() => {
    if (initialTask) {
      setValues({
        goal_id: initialTask.goal_id,
        title: initialTask.title,
        description: initialTask.description ?? "",
        difficulty: initialTask.difficulty,
        priority: initialTask.priority,
        deadline_date: initialTask.deadline_date ?? "",
        status: initialTask.status,
      });
      return;
    }

    setValues((prev) => ({
      ...defaultValues,
      goal_id: goals[0]?.id ?? prev.goal_id,
    }));
  }, [goals, initialTask]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);

    if (!initialTask) {
      setValues({
        ...defaultValues,
        goal_id: goals[0]?.id ?? "",
      });
    }
  };

  const hasGoals = goals.length > 0;

  return (
    <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-white">{initialTask ? "Edit Weekly Task" : "Create Weekly Task"}</h2>
        {initialTask && onCancelEdit ? (
          <button type="button" onClick={onCancelEdit} className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-100 hover:bg-zinc-800">
            Cancel edit
          </button>
        ) : null}
      </div>

      {!hasGoals ? (
        <p className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-200">
          Create at least one monthly goal first. Weekly tasks are linked to goals.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm text-zinc-300">
          Goal
          <select
            value={values.goal_id}
            onChange={(e) => setValues((prev) => ({ ...prev, goal_id: e.target.value }))}
            className="rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-zinc-100"
            disabled={!hasGoals || loading}
            required
          >
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm text-zinc-300 md:col-span-2">
          Title
          <input
            value={values.title}
            onChange={(e) => setValues((prev) => ({ ...prev, title: e.target.value }))}
            className="rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-zinc-100"
            placeholder="Ex: Solve 10 SQL exercises"
            disabled={!hasGoals || loading}
            required
          />
        </label>

        <label className="grid gap-1 text-sm text-zinc-300 md:col-span-2">
          Description (optional)
          <textarea
            value={values.description}
            onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
            className="min-h-24 rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-zinc-100"
            placeholder="Short notes for this task"
            disabled={!hasGoals || loading}
          />
        </label>

        <label className="grid gap-1 text-sm text-zinc-300">
          Difficulty
          <select
            value={values.difficulty}
            onChange={(e) => setValues((prev) => ({ ...prev, difficulty: e.target.value as TaskFormValues["difficulty"] }))}
            className="rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-zinc-100"
            disabled={!hasGoals || loading}
          >
            <option value="light">Light</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm text-zinc-300">
          Priority
          <select
            value={values.priority}
            onChange={(e) => setValues((prev) => ({ ...prev, priority: e.target.value as TaskFormValues["priority"] }))}
            className="rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-zinc-100"
            disabled={!hasGoals || loading}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm text-zinc-300">
          Deadline (optional)
          <input
            type="date"
            value={values.deadline_date}
            onChange={(e) => setValues((prev) => ({ ...prev, deadline_date: e.target.value }))}
            className="rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-zinc-100"
            disabled={!hasGoals || loading}
          />
        </label>

        <label className="grid gap-1 text-sm text-zinc-300">
          Status
          <select
            value={values.status}
            onChange={(e) => setValues((prev) => ({ ...prev, status: e.target.value as TaskFormValues["status"] }))}
            className="rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-zinc-100"
            disabled={!hasGoals || loading}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={!hasGoals || loading}
            className="rounded-lg bg-amber-300 px-4 py-2 font-semibold text-zinc-950 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : initialTask ? "Update task" : "Create task"}
          </button>
        </div>
      </form>
    </section>
  );
}
