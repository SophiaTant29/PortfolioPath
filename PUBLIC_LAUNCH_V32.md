# Public Launch Candidate v32

Key launch hardening in v32:
- Public-facing Terms, Privacy Notice, and investment-education disclosures no longer contain testing placeholders.
- Signup requires acceptance of Terms/Privacy and fails safely if Supabase email confirmation is not enforced.
- Added confirmation callback support, forgot-password flow, and update-password flow.
- Added user-initiated account deletion.
- Renamed Category Fit to **Research Relevance** and reduced suitability-like language.
- Homepage makes Learning Center visible before signup.
- Retains amount-aware portfolio complexity from v29.
- Retains monthly ETF overlap architecture and expanded fallback coverage from v30/v31.
- Browser analytics calls now route through an authenticated Next.js proxy.
- Render `/api/*` endpoints require a server-to-server `BACKEND_SHARED_SECRET` in production.
- Added a public-launch static validation script and explicit deployment checklist.

This is a public-launch **candidate**. External service settings (Supabase email confirmation, URLs, SMTP, Vercel/Render secrets) cannot be guaranteed by code alone and are mandatory launch gates.
