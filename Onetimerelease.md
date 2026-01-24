# One-Time Release Guide - Schrute CTF

This guide covers the initial, one-time setup required to get the Schrute CTF platform live in a production environment.

## 1. Third-Party Service Registration

### OAuth (SSO) Registration
You need to register the application with GitHub and Google to enable social login.

#### GitHub SSO
1. Go to [GitHub Developer Settings](https://github.com/settings/developers) -> **OAuth Apps** -> **New OAuth App**.
2. **Homepage URL**: `https://your-frontend-domain.vercel.app`
3. **Authorization callback URL**: `https://your-backend-domain.com/auth/callback/github`
4. Copy the **Client ID** and generate a **Client Secret**.

#### Google SSO
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Search for **APIs & Services** -> **OAuth consent screen** (Set it up as "External").
4. Go to **Credentials** -> **Create Credentials** -> **OAuth client ID**.
5. **Application type**: Web application.
6. **Authorized JavaScript origins**: `https://your-frontend-domain.vercel.app`
7. **Authorized redirect URIs**: `https://your-backend-domain.com/auth/callback/google`
8. Copy the **Client ID** and **Client Secret**.

### PostHog Analytics
1. Sign up at [PostHog](https://app.posthog.com/signup).
2. Create a new project named "Schrute CTF".
3. Copy the **Project API Key** (found in Project Settings).

---

## 2. Database Creation & Security (Neon)
The production environment requires a managed PostgreSQL instance. We will implement **Principle of Least Privilege** (PoLP) by separating the "Migration/Admin" role from the "App" role.

1. **Create Project**: Go to [Neon](https://neon.tech/) and create a new project.
2. **Setup Roles**: In the Neon SQL Editor, run the following to create a restricted application user:
   ```sql
   -- 1. Create the application user (if not done via UI)
   CREATE USER ctf_app_user WITH PASSWORD 'your_secure_password';

   -- 2. Grant basic access to the schema
   GRANT USAGE ON SCHEMA public TO ctf_app_user;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ctf_app_user;

   -- 3. APPLY RESTRICTION: Revoke Read/Update/Delete on sensitive logs
   REVOKE ALL ON TABLE prompt_logs FROM ctf_app_user;
   GRANT INSERT ON TABLE prompt_logs TO ctf_app_user;

   -- 4. Future tables: Ensure app user can access future tables (optional if migrations run as owner)
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ctf_app_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM ctf_app_user; -- Manual tweak needed per table if new logs added
   ```
3. **Admin User**: Your default project owner (e.g., `alex`) will serve as the "Admin" who can read all logs.
4. **Connection Strings**:
   - **Admin/Migration URL**: `postgresql+asyncpg://owner_user:pass@host/dbname` (Use this for `alembic` migrations).
   - **App URL**: `postgresql+asyncpg://ctf_app_user:pass@host/dbname` (Use this in the Backend Environment Variables).

---

## 3. Backend Deployment (Google Cloud Run - GCP)
Google Cloud Run is a managed compute platform that automatically scales your stateless containers.

1. **Install Google Cloud SDK**: [Install instructions](https://cloud.google.com/sdk/docs/install).
2. **Setup Project**:
   ```bash
   gcloud auth login
   gcloud projects create schrute-ctf-project --set-as-default
   gcloud services enable run.googleapis.com containerregistry.googleapis.com
   ```
3. **Deploy from Source**:
   From the `/backend` directory, run:
   ```bash
   gcloud run deploy schrute-ctf-api \
     --source . \
     --region us-central1 \
     --allow-unauthenticated \
     --memory=1Gi \
     --set-env-vars="DEBUG=False,NEXT_PUBLIC_API_URL=https://schrute-ctf-api-xxxx.a.run.app"
   ```
   *Note: GCP will automatically pick up your `Dockerfile`.*

4. **Set Sensitive Secrets**:
   For production security, use the following to update your secrets:
   ```bash
   gcloud run services update schrute-ctf-api \
     --set-env-vars="DATABASE_URL=your_neon_app_url" \
     --set-env-vars="SECRET_KEY=your_random_hex" \
     --set-env-vars="GITHUB_CLIENT_ID=xxx,GITHUB_CLIENT_SECRET=xxx" \
     --set-env-vars="GOOGLE_CLIENT_ID=xxx,GOOGLE_CLIENT_SECRET=xxx" \
     --set-env-vars="CORS_ORIGINS=https://your-frontend.vercel.app"
   ```

5. **Final URL**: After deployment, gcloud will provide a Service URL like `https://schrute-ctf-api-xxxx.a.run.app`. This is your `NEXT_PUBLIC_API_URL`.

---

## 4. Frontend Deployment (Vercel)
The frontend is optimized for Vercel.

1. Connect your GitHub repository to [Vercel](https://vercel.com/).
2. Point the "Root Directory" to `/frontend`.
3. Set the following **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-domain.com` (Your backend URL).
   - `NEXT_PUBLIC_POSTHOG_KEY`: Your PostHog Project API Key.
4. Deploy!

---

## 5. Final Initial Setup (Database Migration)
Once the backend is live, you must run the initial migration to create the tables.

1. Access your backend's terminal or run this command via a CI/CD job/local machine pointing to the remote DB:
   ```bash
   cd backend
   export DATABASE_URL=your_remote_db_url
   alembic upgrade head
   ```

---
*Bears. Beets. Big Launch.*
