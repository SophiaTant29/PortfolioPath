# Hosted Alpha Status — v18

## Completed in repository
- Full Supabase baseline migration
- Timestamped migration history
- Supabase local CLI config
- Render dynamic `$PORT` support
- Render `/health` readiness check
- Vercel frontend config
- GitHub CI for backend + frontend
- Manual GitHub Action for Supabase migration deployment
- Hosted frontend/API smoke-check script
- Migration validation script
- Hosted-alpha runbook

## Requires account credentials / external action
These cannot be completed safely from the generated repository alone:
- creating the GitHub repository
- creating/linking the Supabase project
- entering Supabase access/database credentials
- creating the Render service
- entering the FMP API key
- creating the Vercel project
- entering production environment variables
- configuring real production domains
- inviting alpha users

## Recommended next milestone
Perform the actual deployment using `HOSTED_ALPHA_RUNBOOK.md`, then run the two-user isolation test and full alpha acceptance checklist.
