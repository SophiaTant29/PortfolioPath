# PortfolioPath v30 — Vercel / Render CORS

The backend now accepts:

- the exact `FRONTEND_ORIGIN` configured in Render,
- local development origins,
- PortfolioPath Vercel deployment URLs matching the restricted PortfolioPath team pattern.

Optional Render variable:

`FRONTEND_ORIGIN_REGEX`

If PortfolioPath later moves to a custom domain or different Vercel team, update the exact origin and/or regex instead of allowing all `*.vercel.app` domains.
