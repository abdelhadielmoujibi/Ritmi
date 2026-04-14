"use client";

import { MonthlyGoal } from "@/types/db";

type GoalListProps = {
  goals: MonthlyGoal[];
  onEdit: (goal: MonthlyGoal) => void;
  onDelete: (goalId: string) => Promise<void>;
};

const priorityStyle = {
  low: "bg-zinc-300/15 text-zinc-200",
  medium: "bg-sky-300/15 text-sky-200",
  high: "bg-fuchsia-300/15 text-fuchsia-200",
};

export function GoalList({ goals, onEdit, onDelete }: GoalListProps) {
  if (goals.length === 0) {
    return (
      <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-6 shadow-sm backdrop-blur">
        <h2 className="text-lg font-semibold text-white">Monthly Goals</h2>
        <p className="mt-3 text-sm text-zinc-300">No goals yet. Add your first monthly goal to unlock weekly tasks creation.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Monthly Goals</h2>
        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-200">{goals.length} goals</span>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => (
          <article key={goal.id} className="rounded-xl border border-zinc-700 bg-zinc-950/70 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white">{goal.title}</h3>
                  {goal.priority ? <span className={`rounded-full px-2 py-1 text-xs font-semibold ${priorityStyle[goal.priority]}`}>{goal.priority}</span> : null}
                </div>
                {goal.description ? <p className="text-sm text-zinc-300">{goal.description}</p> : <p className="text-sm text-zinc-500">No description</p>}
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => onEdit(goal)} className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-100 hover:bg-zinc-800">
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(goal.id)}
                  className="rounded-lg border border-rose-300/40 px-3 py-1.5 text-sm text-rose-200 hover:bg-rose-300/10"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
