# PortfolioPath Hosted Alpha Runbook

This repository is prepared for a first hosted alpha using:

- **Frontend:** Vercel
- **Database/Auth:** Supabase
- **Analytics API:** Render
- **Source/CI:** GitHub

## A. Push the repository to GitHub

Create a private repository and push the contents of `PortfolioPath_Production_v18`.

CI runs backend tests and the frontend typecheck/lint/build on pushes and pull requests.

## B. Create the Supabase project

Create an alpha Supabase project.

Install or run the Supabase CLI, then from the repository root:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

The `supabase/migrations/` directory now contains a full baseline migration, so a new project can be created reproducibly from migration history.

Configure Authentication:
- enable email/password
- set the production site URL after Vercel is deployed
- add allowed redirect URLs for the Vercel deployment

## C. Deploy the FastAPI backend to Render

Create a Render Blueprint from this repository using `render.yaml`.

Set secrets:
- `FMP_API_KEY`
- `FRONTEND_ORIGIN`

The Docker image listens on Render's injected `$PORT`.
The health check path is `/health`.

After deploy, verify:

```text
https://YOUR-API.onrender.com/health
```

## D. Deploy the frontend to Vercel

Import the GitHub repository into Vercel.

Set the project **Root Directory** to:

```text
frontend
```

Configure:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_API_BASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

`NEXT_PUBLIC_*` variables are browser-visible by design. Never put secret API keys behind that prefix.

After the frontend URL exists, update Render's `FRONTEND_ORIGIN` to that exact HTTPS origin and redeploy the API.

Then update Supabase Auth:
- Site URL = Vercel production URL
- Redirect URL(s) = production URL patterns used by the app

## E. Hosted smoke check

From a machine with internet access:

```bash
FRONTEND_URL=https://YOUR-APP.vercel.app \
API_URL=https://YOUR-API.onrender.com \
python scripts/smoke_hosted.py
```

## F. Two-user isolation test

Create User A and User B.

For each:
1. create a portfolio
2. complete questionnaire
3. add planned selections
4. add a simulated transaction

Confirm User A cannot fetch or see User B records and vice versa.

## G. Full alpha acceptance path

Run:

Account → Portfolio → Questionnaire → Recommendation → Builder → Research → Practice → Performance → Review → Insights → Alerts

Use `ALPHA_CHECKLIST.md` for the full acceptance test.

## H. Before inviting testers

Do not skip:
- replace placeholder terms/privacy language with reviewed language
- confirm market-data display/license terms
- add error monitoring
- verify backups
- keep the project invite-only until the alpha is stable
