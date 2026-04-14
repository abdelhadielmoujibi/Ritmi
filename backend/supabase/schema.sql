-- StudyPulse AI - Supabase schema (MVP)
-- Run this file in Supabase SQL Editor.

create extension if not exists pgcrypto;

-- -------------------------
-- Utility trigger: updated_at
-- -------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -------------------------
-- Profiles (single role: student)
-- -------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role = 'student'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Optional: auto-create profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- -------------------------
-- Monthly Goals
-- -------------------------
create table if not exists public.monthly_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  priority text check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_monthly_goals_updated_at on public.monthly_goals;
create trigger trg_monthly_goals_updated_at
before update on public.monthly_goals
for each row execute function public.set_updated_at();

-- -------------------------
-- Weekly Tasks
-- -------------------------
create table if not exists public.weekly_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.monthly_goals(id) on delete cascade,
  title text not null,
  description text,
  difficulty text not null check (difficulty in ('light', 'medium', 'hard')),
  priority text not null check (priority in ('low', 'medium', 'high')),
  deadline_date date,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_weekly_tasks_updated_at on public.weekly_tasks;
create trigger trg_weekly_tasks_updated_at
before update on public.weekly_tasks
for each row execute function public.set_updated_at();

-- -------------------------
-- Daily Check-ins
-- -------------------------
create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_date date not null default current_date,
  energy int not null check (energy between 1 and 10),
  focus int not null check (focus between 1 and 10),
  stress int not null check (stress between 1 and 10),
  sleep_quality int not null check (sleep_quality between 1 and 10),
  motivation int not null check (motivation between 1 and 10),
  available_time_minutes int not null check (available_time_minutes > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, checkin_date)
);

drop trigger if exists trg_daily_checkins_updated_at on public.daily_checkins;
create trigger trg_daily_checkins_updated_at
before update on public.daily_checkins
for each row execute function public.set_updated_at();

-- -------------------------
-- Daily Recommendations
-- -------------------------
create table if not exists public.daily_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_id uuid not null unique references public.daily_checkins(id) on delete cascade,
  recommendation_date date not null default current_date,
  recommended_task text not null,
  recommended_mode text not null check (recommended_mode in ('deep', 'normal', 'light', 'recovery')),
  explanation text not null,
  avoid_text text not null,
  recovery_alert boolean not null default false,
  recovery_actions jsonb,
  recommended_task_id uuid references public.weekly_tasks(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, recommendation_date)
);

drop trigger if exists trg_daily_recommendations_updated_at on public.daily_recommendations;
create trigger trg_daily_recommendations_updated_at
before update on public.daily_recommendations
for each row execute function public.set_updated_at();

-- -------------------------
-- Indexes
-- -------------------------
create index if not exists idx_monthly_goals_user_created
  on public.monthly_goals (user_id, created_at desc);

create index if not exists idx_weekly_tasks_user_status_deadline
  on public.weekly_tasks (user_id, status, deadline_date);

create index if not exists idx_weekly_tasks_goal
  on public.weekly_tasks (goal_id);

create index if not exists idx_daily_checkins_user_date
  on public.daily_checkins (user_id, checkin_date desc);

create index if not exists idx_daily_recommendations_user_date
  on public.daily_recommendations (user_id, recommendation_date desc);

create index if not exists idx_daily_recommendations_recovery
  on public.daily_recommendations (user_id, recovery_alert, recommendation_date desc);

-- -------------------------
-- Row Level Security (RLS)
-- -------------------------
alter table public.profiles enable row level security;
alter table public.monthly_goals enable row level security;
alter table public.weekly_tasks enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.daily_recommendations enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles for select
using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists monthly_goals_select_own on public.monthly_goals;
create policy monthly_goals_select_own
on public.monthly_goals for select
using (auth.uid() = user_id);

drop policy if exists monthly_goals_insert_own on public.monthly_goals;
create policy monthly_goals_insert_own
on public.monthly_goals for insert
with check (auth.uid() = user_id);

drop policy if exists monthly_goals_update_own on public.monthly_goals;
create policy monthly_goals_update_own
on public.monthly_goals for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists monthly_goals_delete_own on public.monthly_goals;
create policy monthly_goals_delete_own
on public.monthly_goals for delete
using (auth.uid() = user_id);

drop policy if exists weekly_tasks_select_own on public.weekly_tasks;
create policy weekly_tasks_select_own
on public.weekly_tasks for select
using (auth.uid() = user_id);

drop policy if exists weekly_tasks_insert_own on public.weekly_tasks;
create policy weekly_tasks_insert_own
on public.weekly_tasks for insert
with check (auth.uid() = user_id);

drop policy if exists weekly_tasks_update_own on public.weekly_tasks;
create policy weekly_tasks_update_own
on public.weekly_tasks for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists weekly_tasks_delete_own on public.weekly_tasks;
create policy weekly_tasks_delete_own
on public.weekly_tasks for delete
using (auth.uid() = user_id);

drop policy if exists daily_checkins_select_own on public.daily_checkins;
create policy daily_checkins_select_own
on public.daily_checkins for select
using (auth.uid() = user_id);

drop policy if exists daily_checkins_insert_own on public.daily_checkins;
create policy daily_checkins_insert_own
on public.daily_checkins for insert
with check (auth.uid() = user_id);

drop policy if exists daily_checkins_update_own on public.daily_checkins;
create policy daily_checkins_update_own
on public.daily_checkins for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists daily_checkins_delete_own on public.daily_checkins;
create policy daily_checkins_delete_own
on public.daily_checkins for delete
using (auth.uid() = user_id);

drop policy if exists daily_recommendations_select_own on public.daily_recommendations;
create policy daily_recommendations_select_own
on public.daily_recommendations for select
using (auth.uid() = user_id);

drop policy if exists daily_recommendations_insert_own on public.daily_recommendations;
create policy daily_recommendations_insert_own
on public.daily_recommendations for insert
with check (auth.uid() = user_id);

drop policy if exists daily_recommendations_update_own on public.daily_recommendations;
create policy daily_recommendations_update_own
on public.daily_recommendations for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists daily_recommendations_delete_own on public.daily_recommendations;
create policy daily_recommendations_delete_own
on public.daily_recommendations for delete
using (auth.uid() = user_id);
