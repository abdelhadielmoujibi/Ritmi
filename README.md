# Ritmi

Ritmi is an adaptive study planning assistant for students.
It combines daily condition signals, weekly workload, and monthly goals to recommend the most realistic task for today.

> Formerly named **StudyPulse AI**.

<!-- README-I18N:START -->

**English**

<!-- README-I18N:END -->

## Table of Contents

- [Why Ritmi](#why-ritmi)
- [Core Features](#core-features)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Surface](#api-surface)
- [Data Model](#data-model)
- [Demo Flow](#demo-flow)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Why Ritmi

Most student planners fail because they assume every day has the same energy and focus.
Ritmi adapts study decisions to the student's real daily state to protect consistency and reduce overload.

Ritmi is:

- an adaptive study planner
- an AI-supported academic decision assistant
- a consistency and recovery support tool

Ritmi is not:

- a therapist or medical diagnosis system
- a generic chatbot
- a calendar replacement

## Core Features

1. **Monthly Goals**: define medium-term learning outcomes.
2. **Weekly Tasks**: break goals into actionable tasks with priority and difficulty.
3. **Daily Check-In**: capture energy, focus, stress, sleep, motivation, and available time.
4. **Daily Recommendation Agent**: propose one best-fit action for today.
5. **Negative Streak Detection**: detect consecutive difficult days.
6. **Recovery Mode Advice**: reduce overload with practical, supportive actions.
7. **Student Dashboard + History**: track trends, consistency, and recommendation history.

## How It Works

Ritmi uses a hybrid approach:

- **Rule-based layer** decides day quality, checks streaks, and matches task intensity.
- **AI layer** explains the recommendation in natural language and generates supportive recovery advice.

### Decision Signals

- `energy` (1-10)
- `focus` (1-10)
- `stress` (1-10)
- `sleep_quality` (1-10)
- `motivation` (1-10)
- `available_time_minutes`
- pending tasks with difficulty, priority, and deadlines

### Negative Streak Rule (MVP)

A day is considered negative when at least 3 of these are true:

- `energy <= 4`
- `focus <= 4`
- `stress >= 7`
- `sleep_quality <= 4`
- `motivation <= 4`

If 4 consecutive negative days are detected, Ritmi triggers recovery mode.

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Pydantic
- **Auth + Database**: Supabase Auth, Supabase PostgreSQL, RLS policies
- **AI**: OpenAI API (`gpt-4o-mini` by default)

## Project Structure

```text
.
├─ frontend/
│  ├─ src/app/            # Next.js App Router pages
│  ├─ src/components/     # UI and feature components
│  └─ .env.local.example
├─ backend/
│  ├─ app/api/v1/endpoints/
│  ├─ app/services/       # rules engine, streak detector, recommendation service
│  ├─ supabase/schema.sql
│  └─ .env.example
└─ docs/
   └─ architecture.md
```

## Getting Started

### 1) Prerequisites

- Node.js 18+
- Python 3.11+
- Supabase project
- OpenAI API key

### 2) Configure Supabase schema

Run the SQL file in your Supabase SQL Editor:

- `backend/supabase/schema.sql`

### 3) Backend setup

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
# Windows (PowerShell)
Copy-Item .env.example .env
# macOS/Linux
# cp .env.example .env
```

Update `backend/.env` with your values:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

Start the API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4) Frontend setup

```bash
cd frontend
npm install
# Windows (PowerShell)
Copy-Item .env.local.example .env.local
# macOS/Linux
# cp .env.local.example .env.local
npm run dev
```

Set these values in `frontend/.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`)

App URL:

- `http://localhost:3000`

Health check:

- `http://localhost:8000/api/v1/health`

### 5) Optional demo data

After creating a user account once, seed sample goals, tasks, check-ins, and recommendations:

```bash
cd backend
python scripts/seed_demo_history.py
```

## API Surface

Backend routes are registered under `/api/v1`.

- `GET /health`
- `POST /goals`
- `POST /tasks`
- `POST /checkins`
- `POST /recommendations/rules`
- `POST /recommendations/select-task`
- `POST /recommendations/daily`
- `POST /recommendations/generate`
- `POST /recommendations/generate-ai`
- `POST /recommendations/generate-and-save`
- `GET /dashboard`
- `GET /history`

## Data Model

Main entities:

- `profiles`
- `monthly_goals`
- `weekly_tasks`
- `daily_checkins`
- `daily_recommendations`

Recommendation output fields:

- `recommended_task`
- `recommended_mode` (`deep | normal | light | recovery`)
- `explanation`
- `avoid_text`
- `recovery_alert`
- `recovery_actions`

## Demo Flow

1. User defines monthly goals.
2. User creates weekly tasks.
3. User completes daily check-in.
4. Ritmi returns today's recommended task + mode + explanation.
5. If negative streak exists, Ritmi shows recovery-oriented advice.

## Roadmap

- Improve trend visualizations and reflection prompts
- Add richer recommendation explainability controls
- Add notification and reminder experiments
- Add optional voice check-in prototype

## Contributing

Contributions are welcome.

1. Fork the repo
2. Create a feature branch
3. Commit with clear messages
4. Open a pull request with context and screenshots when relevant

Please keep contributions aligned with the MVP promise: adaptive daily study decisions and early recovery support.

## License

This project is open source under the MIT License. See `LICENSE`.
