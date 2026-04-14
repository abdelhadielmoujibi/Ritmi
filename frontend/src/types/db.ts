export type TaskDifficulty = "light" | "medium" | "hard";
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "completed";

export type MonthlyGoalLite = {
  id: string;
  title: string;
};

export type GoalPriority = "low" | "medium" | "high";

export type MonthlyGoal = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: GoalPriority | null;
  created_at: string;
  updated_at: string;
};

export type GoalFormValues = {
  title: string;
  description: string;
  priority: GoalPriority;
};

export type WeeklyTask = {
  id: string;
  user_id: string;
  goal_id: string;
  title: string;
  description: string | null;
  difficulty: TaskDifficulty;
  priority: TaskPriority;
  deadline_date: string | null;
  status: TaskStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskFormValues = {
  goal_id: string;
  title: string;
  description: string;
  difficulty: TaskDifficulty;
  priority: TaskPriority;
  deadline_date: string;
  status: TaskStatus;
};
