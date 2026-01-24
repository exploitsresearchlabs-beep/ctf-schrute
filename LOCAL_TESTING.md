# Local Testing Guide - Schrute CTF

Testing locally is much faster than deploying to GCP. You have two main options:

## Option 1: Docker Compose (Recommended)
This runs the entire stack (Backend, Frontend, and a local PostgreSQL DB) as containers.

1. **Create a `.env` file** in the root directory:
   ```env
   # Database (This points to the 'db' container defined in docker-compose.yml)
   DATABASE_URL=postgresql+asyncpg://schrute_ctf:password123@db:5432/neondb
   
   # App Secrets
   SECRET_KEY=local-secret-key
   CORS_ORIGINS=http://localhost:3000
   
   # OAuth (Optional for local testing)
   GITHUB_CLIENT_ID=xxx
   GITHUB_CLIENT_SECRET=xxx
   ```

2. **Start the stack**:
   ```bash
   docker-compose up --build
   ```
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`

---

## Option 2: Manual (Fastest for Code Changes)
Best if you want to see changes instantly without rebuilding Docker images.

### 1. Start the Backend
1. Go to `/backend`.
2. Ensure your virtual environment is active: `source venv/bin/activate`.
3. Set environment variables (or use a `.env` file in `/backend`):
   ```bash
   export DATABASE_URL=sqlite+aiosqlite:///./test.db
   export SECRET_KEY=test-key
   ```
4. Run the API:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### 2. Start the Frontend
1. Open a new terminal in `/frontend`.
2. Install dependencies (one-time): `npm install`.
3. Set environment variable:
   ```bash
   export NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Run the Dev server:
   ```bash
   npm run dev
   ```
   - Frontend available at `http://localhost:3000`.

---

## Tip: Bypass OAuth for Local Testing
If you don't want to set up GitHub/Google keys for local testing, I suggest using the **SQLite** URL (`sqlite+aiosqlite:///./test.db`) for the `DATABASE_URL`. It's zero-config and perfect for testing Dwight's logic! 🥬🔭
