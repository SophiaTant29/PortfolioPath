# PortfolioPath First Alpha Deployment Plan

## Recommended stack
Frontend: Vercel
Database/Auth: Supabase
FastAPI: Render / Railway / Fly.io / AWS
Market data: server-side provider only

## Order of deployment
1. Create production Supabase project.
2. Run `supabase/schema.sql`.
3. Configure authentication and allowed redirect URLs.
4. Deploy FastAPI with backend environment variables.
5. Confirm `/health`.
6. Deploy Next.js with production Supabase and API variables.
7. Restrict backend CORS to the deployed frontend origin.
8. Create two test user accounts.
9. Run cross-user isolation tests.
10. Complete the full alpha checklist.

## First-user acceptance path
- Sign up
- Create portfolio
- Complete questionnaire
- Build allocation
- Research stock and ETF
- Record simulated trade
- View performance
- Run review
- Open insights and alerts
- Log out and back in
- Confirm persistence

## Before external testers
- legal/disclosure review
- privacy policy
- terms
- market-data display/license confirmation
- monitoring/error tracking
- backup and rollback plan
