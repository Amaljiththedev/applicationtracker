## Supabase + Deployment Guide

### 1) Supabase setup
- Create a Supabase project.
- In SQL editor, run `backend/supabase/schema.sql`.
- Enable Google provider in Supabase Auth.
- Add authorized redirect URL:
  - `http://localhost:3000/dashboard`
  - `https://your-frontend.vercel.app/dashboard`

### 2) Local environment
- Frontend: copy `frontend/.env.example` to `frontend/.env.local`.
- Backend: copy `backend/.env.example` to `backend/.env`.

### 3) Run locally
- Frontend:
  - `cd frontend`
  - `npm install`
  - `npm run dev`
- Backend:
  - `cd backend`
  - `python3 -m venv .venv`
  - `.venv/bin/pip install -r requirements.txt`
  - `.venv/bin/uvicorn app.main:app --reload --port 8000`

### 4) Deploy
- Frontend to Vercel from `frontend`.
- Backend to Railway or Render from `backend`.
- Backend start command:
  - `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 5) Production env vars
- Frontend (Vercel):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_API_URL`
- Backend (Railway/Render):
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_JWT_SECRET`
  - `ALLOWED_ORIGINS=https://your-frontend.vercel.app`

### 6) Smoke test
- Login via Google from production frontend.
- Create application, refresh page, confirm persistence.
- Update and delete application.
- Login with another account and verify data isolation.
