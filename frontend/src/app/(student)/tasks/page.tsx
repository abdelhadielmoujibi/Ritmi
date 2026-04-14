"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { TaskForm } from "@/components/forms/TaskForm";
import { TaskList } from "@/components/tasks/TaskList";
import { createClient } from "@/lib/supabase/client";
import { MonthlyGoalLite, TaskFormValues, WeeklyTask } from "@/types/db";

export default function TasksPage() {
  const supabase = useMemo(() => createClient(), []);

  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [goals, setGoals] = useState<MonthlyGoalLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<WeeklyTask | null>(null);

  const loadData = useCallback(async () => {
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

    const [tasksRes, goalsRes] = await Promise.all([
      supabase
        .from("weekly_tasks")
        .select("id,user_id,goal_id,title,description,difficulty,priority,deadline_date,status,completed_at,created_at,updated_at")
        .order("created_at", { ascending: false }),
      supabase.from("monthly_goals").select("id,title").order("created_at", { ascending: false }),
    ]);

    if (tasksRes.error) {
      setError(tasksRes.error.message);
    } else {
      setTasks((tasksRes.data ?? []) as WeeklyTask[]);
    }

    if (goalsRes.error) {
      setError(goalsRes.error.message);
    } else {
      setGoals((goalsRes.data ?? []) as MonthlyGoalLite[]);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const saveTask = async (values: TaskFormValues) => {
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
      goal_id: values.goal_id,
      title: values.title.trim(),
      description: values.description.trim() || null,
      difficulty: values.difficulty,
      priority: values.priority,
      deadline_date: values.deadline_date || null,
      status: values.status,
      completed_at: values.status === "completed" ? new Date().toISOString() : null,
    };

    if (editingTask) {
      const { data, error: updateError } = await supabase
        .from("weekly_tasks")
        .update(payload)
        .eq("id", editingTask.id)
        .select("id,user_id,goal_id,title,description,difficulty,priority,deadline_date,status,completed_at,created_at,updated_at")
        .single();

      if (updateError) {
        setError(updateError.message);
      } else {
        setTasks((prev) => prev.map((task) => (task.id === editingTask.id ? (data as WeeklyTask) : task)));
        setEditingTask(null);
      }

      setSaving(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("weekly_tasks")
      .insert(payload)
      .select("id,user_id,goal_id,title,description,difficulty,priority,deadline_date,status,completed_at,created_at,updated_at")
      .single();

    if (insertError) {
      setError(insertError.message);
    } else {
      setTasks((prev) => [data as WeeklyTask, ...prev]);
    }

    setSaving(false);
  };

  const deleteTask = async (taskId: string) => {
    setError(null);
    const { error: deleteError } = await supabase.from("weekly_tasks").delete().eq("id", taskId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    if (editingTask?.id === taskId) {
      setEditingTask(null);
    }
  };

  const toggleComplete = async (task: WeeklyTask) => {
    setError(null);
    const nextStatus = task.status === "completed" ? "pending" : "completed";

    const { data, error: updateError } = await supabase
      .from("weekly_tasks")
      .update({
        status: nextStatus,
        completed_at: nextStatus === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", task.id)
      .select("id,user_id,goal_id,title,description,difficulty,priority,deadline_date,status,completed_at,created_at,updated_at")
      .single();

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setTasks((prev) => prev.map((item) => (item.id === task.id ? (data as WeeklyTask) : item)));
    if (editingTask?.id === task.id) {
      setEditingTask(data as WeeklyTask);
    }
  };

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8">
      <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 shadow-sm backdrop-blur">
        <h1 className="text-2xl font-bold text-white">Weekly Tasks</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Create and manage weekly tasks with difficulty, priority, deadline, and completion status.
        </p>
      </section>

      {error ? <p className="rounded-xl border border-rose-300/35 bg-rose-300/10 p-3 text-sm text-rose-200">{error}</p> : null}

      {loading ? (
        <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-6 shadow-sm backdrop-blur">
          <p className="text-sm text-zinc-300">Loading tasks...</p>
        </section>
      ) : (
        <>
          <TaskForm goals={goals} initialTask={editingTask} loading={saving} onSubmit={saveTask} onCancelEdit={() => setEditingTask(null)} />
          <TaskList tasks={tasks} onEdit={setEditingTask} onDelete={deleteTask} onToggleComplete={toggleComplete} />
        </>
      )}
    </main>
  );
}
