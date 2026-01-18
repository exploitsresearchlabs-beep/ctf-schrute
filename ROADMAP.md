# Schrute CTF - Next Steps Roadmap

This document outlines the remaining integration and production readiness tasks for the Schrute CTF platform.

## 1. OAuth Configuration
To enable the feedback system and persistent user rankings.

- **Objective**: Replace anonymous sessions with optional GitHub/Google login.
- **Backend Implementation**:
  - Install `authlib` and `httpx`.
  - Create `/auth/login` and `/auth/callback` endpoints in FastAPI.
  - Secure tokens using `JOSE` (JWT).
- **Frontend Implementation**:
  - Integrate `next-auth` (Auth.js) for easy social login.
  - Update `ChatInterface` to sync session ID with user profile if logged in.
- **Environment Variables**:
  - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

## 2. PostHog Analytics Setup
For tracking player conversion and level difficulty.

- **Objective**: Implement product analytics with respect to privacy.
- **Frontend Setup**:
  - Initialize PostHog in `frontend/app/layout.tsx`.
  - Ensure the `ConsentBanner` component correctly toggles `posthog.opt_in_capturing()`.
- **Key Events to Track**:
  - `level_started` (properties: level_id)
  - `prompt_submitted` (properties: level_id, result: CORRECT|CLOSE|WRONG)
  - `level_completed` (properties: level_id, time_taken)
  - `feedback_submitted`

## 3. Database Production Setup
Moving from SQLite to a robust production environment.

- **Objective**: Ensure data persistence and reliability.
- **Architecture**:
  - Use a managed PostgreSQL instance (e.g., Supabase, Neon, or Railway PG).
- **Migration Strategy**:
  - Initialize **Alembic** for backend database migrations.
  - Create the initial migration: `alembic revision --autogenerate -m "Initial schema"`.
- **Schema Polish**:
  - Add indexes on `session_id` and `level_id` for faster lookups.
  - Implement a `DailyStats` table for the leaderboard.

## 4. Release & Deployment
Final steps before going live.

- **Dockerization**:
  - Create `Dockerfile` for the FastAPI backend.
  - Create `Dockerfile` for the Next.js frontend (Multi-stage build).
  - Use `docker-compose.yml` for local production testing.
- **CI/CD Pipeline**:
  - Set up **GitHub Actions** to run `simulate_prompts.py` on every PR.
  - Automate deployments to Vercel (Frontend) and Railway/Fly.io (Backend).
- **Production Checklist**:
  - [ ] Set `DEBUG=False` in backend.
  - [ ] Configure `CORS_ORIGINS` to only allow the production domain.
  - [ ] Set up an SSL certificate (standard with Vercel/Railway).
  - [ ] Generate a strong `SECRET_KEY`.

---

*Bears. Beets. Deployment.*
