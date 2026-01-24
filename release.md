# Incremental Release Guide - Schrute CTF

Follow these steps for standard updates after the initial setup is complete.

## 1. Code Review & Preparation
1. Ensure all features are tested locally.
2. Run the prompt simulation to verify Dwight's behavior:
   ```bash
   cd backend
   python simulate_prompts.py
   ```

## 2. Schema Changes (If any)
If you modified `database.py`:
1. Generate a new migration:
   ```bash
   cd backend
   alembic revision --autogenerate -m "description_of_change"
   ```
2. Commit the new file in `backend/alembic/versions/`.

## 3. Deploying Updates

### Automatic (GitHub CI/CD)
### Google Cloud Run (Backend)
1. Ensure you are in the `/backend` directory.
2. Run `gcloud run deploy schrute-ctf-api --source .`.
3. If you changed secrets, run `gcloud run services update schrute-ctf-api --set-env-vars="KEY=VALUE"`.

### Vercel (Frontend)
1. Pushing to `main` branch will automatically trigger a Vercel rebuild.

### Manual Actions
1. **Apply Migrations**: After the code is deployed, run migrations using the **Admin/Owner connection string**:
   ```bash
   cd backend
   export DATABASE_URL=your_ADMIN_connection_string
   alembic upgrade head
   ```
   *(Most production hosts allow you to set this as a 'release command' to run automatically on deploy).*

## 4. Post-Deployment Verification
1. Check PostHog to ensure events are still flowing.
2. Verify that existing flags still work (Bypass Dwight's new defenses).

---
*Bears. Beets. Best Practices.*
