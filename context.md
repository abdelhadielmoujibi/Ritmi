# StudyPulse AI - Project Context

## Project Name
StudyPulse AI

## Project Type
Hackathon qualification MVP

## Main Goal
Build a web application for students that helps them decide what they should work on today based on their real daily condition, current workload, and longer-term study goals.

The app must also detect a sustained negative pattern across several days and trigger recovery-oriented advice.

This is not just a to-do list.
This is not just a mood tracker.
This is not just a chatbot.

This is an AI-powered adaptive study planning system.

## Core Product Idea
A student uses the app to:
1. define their monthly goals
2. define their weekly tasks
3. check in daily with energy/focus/stress/sleep/motivation data
4. receive an AI-driven recommendation for what they should do today
5. receive recovery advice when the system detects a negative streak over several consecutive days

## Problem Being Solved
Students often create unrealistic study plans that do not adapt to their real physical and mental condition.

Common problems:
- they plan too much
- they do not know what task fits today
- they force themselves to do hard work even on low-energy days
- they lose momentum after several bad days
- they feel guilty and become inconsistent
- normal planners do not adapt to how the student actually feels

This app solves that by combining:
- monthly goals
- weekly tasks
- daily state tracking
- task intensity matching
- negative streak detection
- AI-generated daily decisions

## Main Product Promise
The app recommends the right task for the right day based on the student's real condition.

It should help the student:
- stay consistent
- avoid overload
- adapt their study plan to their energy
- recover early when a negative pattern appears

## Main Features

### 1. User Account
The student can:
- sign up
- log in
- access their personal dashboard

Only one user role is needed for the MVP:
- student

Do not build a multi-role or team-based architecture for now.

### 2. Monthly Goals
The student can create a small set of monthly goals.

Examples:
- finish chapter 3 in mathematics
- complete database project
- revise operating systems
- prepare for midterm exam

Each goal should include:
- title
- optional description
- optional priority
- creation date

### 3. Weekly Tasks
The student can create weekly tasks connected to their goals.

Each weekly task should include:
- title
- optional description
- difficulty level: light / medium / hard
- priority level: low / medium / high
- optional deadline
- status: pending / completed

Examples:
- review algebra notes
- solve 10 SQL exercises
- write introduction for report
- prepare presentation slides

### 4. Daily Check-In
Each day the student completes a short check-in.

The app should collect:
- energy level
- focus level
- stress level
- sleep quality
- motivation level
- available study time today

Recommended scale:
- 1 to 10 for energy, focus, stress, sleep, motivation
- available time as a numeric value or category such as 30 min, 1h, 2h, 3h+

The daily check-in is one of the most important parts of the app.

### 5. AI Daily Decision Agent
This is the heart of the product.

The AI agent must help decide what the student should do today.

It should consider:
- the student's daily check-in
- the student’s available weekly tasks
- task difficulty
- task priority
- deadlines
- recent history
- whether the student is in a normal mode or recovery mode

The output should be:
- recommended task for today
- recommended work mode (deep / normal / light / recovery)
- short explanation
- what to avoid today

### 6. Negative Streak Detection
The system must detect when the student has been in a bad state for several consecutive days.

A negative streak means repeated signals such as:
- low energy
- low focus
- high stress
- poor sleep
- low motivation

For the MVP, use a simple rule-based detection approach.

Example:
If the student has 4 consecutive negative daily check-ins, trigger recovery mode.

This is extremely important because it makes the app more intelligent than a normal planner.

### 7. Recovery Advice
When a negative streak is detected, the app should not continue recommending heavy work.

Instead, it should provide recovery-oriented suggestions such as:
- reduce workload today
- choose one light task only
- take a walk
- sleep earlier
- do light exercise
- avoid starting the hardest task
- reset tomorrow's priorities

The recovery advice must be supportive and practical, not medical.

### 8. Personal Dashboard
The student dashboard should show:
- monthly goals overview
- weekly tasks overview
- last daily check-in summary
- today’s recommendation
- recent consistency / trend information

### 9. History / Trends
The app should store previous check-ins and recommendations.

A history page or dashboard section should show:
- recent daily states
- previous recommendations
- negative streak information
- simple charts if possible

## What the App Is NOT
The app must not be positioned as:
- a therapist
- a psychologist
- a medical diagnosis tool
- a generic chatbot
- a full calendar replacement
- a social app

It is an adaptive academic planning assistant.

## Product Positioning
This product should be presented as:
- an adaptive study planner
- an AI-powered academic decision assistant
- a consistency and recovery support tool for students

## MVP Constraints
This is a hackathon project, so the MVP must be:
- clean
- focused
- realistic
- easy to demo
- not over-engineered

Do not build unnecessary complexity.

Avoid:
- multiple user roles
- team features
- advanced notification infrastructure
- complicated scheduling engines
- too many pages
- too many AI features

## Technical Strategy
Use a hybrid system:

### Rule-based logic
Use normal backend logic to:
- classify the student’s day
- detect negative streaks
- decide recommended task intensity

### AI layer
Use AI to:
- explain the recommendation naturally
- generate daily supportive advice
- generate recovery advice when needed

This is the safest and most practical architecture for a hackathon MVP.

## Daily Decision Logic
The system should decide the best task for today based on:
- current energy
- current focus
- current stress
- current sleep quality
- current motivation
- available time
- available pending tasks
- task difficulty
- task priority
- task deadline

Example logic:
- strong day -> recommend high-priority hard task
- normal day -> recommend medium or high priority medium task
- low-energy day -> recommend light task
- recovery mode -> recommend one light task or recovery action only

## Negative Streak Logic
For the MVP, a check-in can be considered negative if multiple bad indicators are present.

Example rule:
A day is negative if at least 3 of the following are true:
- energy <= 4
- focus <= 4
- stress >= 7
- sleep_quality <= 4
- motivation <= 4

If 4 consecutive negative days exist, trigger recovery mode.

This does not need to be clinically accurate.
It needs to be simple, transparent, and useful.

## UI Expectations
The UI should feel modern and product-oriented.

Main pages:
1. Landing page
2. Login / Signup page
3. Student dashboard
4. Monthly goals page
5. Weekly tasks page
6. Daily check-in page
7. Recommendation result page
8. History / trends page

Design style:
- clean cards
- modern spacing
- strong typography hierarchy
- simple charts
- reassuring and focused tone
- not overly playful
- not cluttered

## Demo Expectations
The demo should clearly show:
1. the student has long-term goals
2. the student has weekly tasks
3. the student checks in today
4. the system decides what fits today
5. the system detects a negative streak and recommends recovery if needed

The jury should feel:
- this solves a real student problem
- this is more intelligent than a normal planner
- this is not just another chatbot
- this can realistically help students stay consistent

## Technical Stack
Frontend:
- Next.js
- Tailwind CSS
- reusable components

Backend:
- FastAPI

Database/Auth:
- Supabase Auth
- Supabase PostgreSQL

AI:
- OpenAI API for recommendation explanation and recovery advice

Optional bonus later:
- charts improvements
- notifications
- voice features

## Data Model Overview
Main entities:
- users
- monthly_goals
- weekly_tasks
- daily_checkins
- daily_recommendations

## Required Outputs of the App

### Daily recommendation
The app should return:
- recommended_task
- recommended_mode
- explanation
- avoid_text
- recovery_alert
- optional recovery_actions

### Example output
- Recommended task: Review database notes for 30 minutes
- Mode: Light
- Explanation: Your energy and focus are low today, so a lighter review task is more realistic and sustainable than starting a hard assignment.
- Avoid: Do not begin your hardest project today.
- Recovery alert: true

## Final Reminder
Always keep the product centered on this core promise:

The app chooses the most suitable study action for today based on the student's real condition, and detects sustained decline early enough to recommend recovery before the student loses consistency.