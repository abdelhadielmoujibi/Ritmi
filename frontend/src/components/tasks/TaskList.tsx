"use client";

import { WeeklyTask } from "@/types/db";

type TaskListProps = {
  tasks: WeeklyTask[];
  onEdit: (task: WeeklyTask) => void;
  onDelete: (taskId: string) => Promise<void>;
  onToggleComplete: (task: WeeklyTask) => Promise<void>;
};

const badgeStyles = {
  difficulty: {
    light: "bg-emerald-300/15 text-emerald-200",
    medium: "bg-amber-300/15 text-amber-200",
    hard: "bg-rose-300/15 text-rose-200",
  },
  priority: {
    low: "bg-zinc-300/15 text-zinc-200",
    medium: "bg-sky-300/15 text-sky-200",
    high: "bg-fuchsia-300/15 text-fuchsia-200",
  },
};

export function TaskList({ tasks, onEdit, onDelete, onToggleComplete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-6 shadow-sm backdrop-blur">
        <h2 className="text-lg font-semibold text-white">Weekly Tasks</h2>
        <p className="mt-3 text-sm text-zinc-300">No tasks yet. Create your first weekly task to start planning.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Weekly Tasks</h2>
        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-200">{tasks.length} tasks</span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <article key={task.id} className="rounded-xl border border-zinc-700 bg-zinc-950/70 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-white">{task.title}</h3>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${badgeStyles.difficulty[task.difficulty]}`}>{task.difficulty}</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${badgeStyles.priority[task.priority]}`}>{task.priority}</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${task.status === "completed" ? "bg-emerald-300/15 text-emerald-200" : "bg-zinc-300/15 text-zinc-200"}`}>
                    {task.status}
                  </span>
                </div>

                {task.description ? <p className="text-sm text-zinc-300">{task.description}</p> : null}

                <div className="mt-2 text-xs text-zinc-400">
                  {task.deadline_date ? `Deadline: ${task.deadline_date}` : "No deadline"}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onToggleComplete(task)}
                  className="rounded-lg border border-emerald-300/40 px-3 py-1.5 text-sm font-medium text-emerald-200 hover:bg-emerald-300/10"
                >
                  {task.status === "completed" ? "Mark pending" : "Mark complete"}
                </button>
                <button type="button" onClick={() => onEdit(task)} className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-100 hover:bg-zinc-800">
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(task.id)}
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
