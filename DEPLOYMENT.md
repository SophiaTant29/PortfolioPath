# PortfolioPath Deployment Guide

## Recommended MVP deployment
- Frontend: Vercel
- Auth + database: Supabase
- FastAPI backend: Render, Railway, Fly.io, or AWS
- Market-data secrets: backend environment variables only

## Required frontend environment variables
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- NEXT_PUBLIC_API_BASE_URL
- SUPABASE_SERVICE_ROLE_KEY (server only; never expose in client code)

## Required backend environment variables
- FMP_API_KEY
- FRONTEND_ORIGIN

## Security checklist
- Keep FMP_API_KEY server-side only.
- Keep SUPABASE_SERVICE_ROLE_KEY server-side only.
- Leave Row Level Security enabled on every user-owned table.
- Do not bypass RLS from browser code.
- Restrict CORS to the deployed frontend origin.
- Use HTTPS in production.
- Rotate any key that has ever been committed publicly.
- Add provider-specific rate-limit monitoring before opening public access.

## Before launch
1. Run Supabase schema.
2. Configure email verification/auth policy.
3. Run backend tests.
4. Test sign-up, sign-in, logout, and cross-user data isolation.
5. Validate market-data failures and fallback states.
6. Confirm financial-data licensing for the intended public product.
7. Add privacy policy, terms, disclosures, and data-retention language.


## v16 deployment assets
- `frontend/vercel.json`
- `render.yaml`
- `frontend/.env.production.example`
- `backend/.env.production.example`
- `scripts/check_release.py`
- `scripts/run_checks.sh`
- `FIRST_RUN_SETUP.md`
- `RELEASE_READINESS.md`

Use these as the first alpha deployment package.


## v18 hosted-alpha changes
The repository now uses a real Supabase migration baseline. For new projects, prefer `supabase db push` from migration history rather than manually pasting `schema.sql`.

Render deployment now listens on the provider-injected `$PORT` and checks `/health`.

GitHub Actions are included for CI and optional migration deployment.
