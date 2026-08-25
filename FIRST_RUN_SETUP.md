# PortfolioPath First-Run Setup

## 1. Create Supabase project
Create a new Supabase project for the alpha environment.

Run:
`supabase/schema.sql`

Then confirm:
- RLS is enabled
- authentication is enabled
- email/password sign-in is available
- redirect URLs include the deployed frontend

## 2. Configure frontend
Copy:
`frontend/.env.production.example`

to your deployment environment and fill:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- NEXT_PUBLIC_API_BASE_URL
- SUPABASE_SERVICE_ROLE_KEY

Never expose the service-role key in client-side code.

## 3. Configure backend
Set:
- FMP_API_KEY
- FRONTEND_ORIGIN

Deploy the FastAPI service and confirm:
`GET /health`

returns status `ok`.

## 4. Deploy frontend
Deploy `frontend/` to Vercel.

Set `NEXT_PUBLIC_API_BASE_URL` to the deployed FastAPI origin.

## 5. Validate auth
Create two test accounts.

Confirm:
- each can create portfolios
- each only sees its own data
- protected routes redirect correctly
- logout works

## 6. Validate full workflow
Run through:
Questionnaire -> Recommendation -> Builder -> Research -> Practice -> Performance -> Review -> Insights -> Alerts

## 7. Run release checks
From project root:

`python scripts/check_release.py`

Then run:
`sh scripts/run_checks.sh`

## 8. Before inviting external testers
Complete `ALPHA_CHECKLIST.md`.
