# StudyPulse AI - Data Layer Setup

This step adds the Supabase schema for the MVP.

## File to run

- `backend/supabase/schema.sql`

Run it in Supabase SQL Editor.

## What it creates

- `profiles` (single role: student)
- `monthly_goals`
- `weekly_tasks`
- `daily_checkins`
- `daily_recommendations`
- useful indexes
- RLS policies to isolate each user data

## Notes

- One check-in per user per day (`unique (user_id, checkin_date)`).
- One recommendation per check-in (`checkin_id unique`).
- Daily recommendation also unique per user/date for MVP clarity.
