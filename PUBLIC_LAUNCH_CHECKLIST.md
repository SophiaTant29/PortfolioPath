# PortfolioPath Public Launch Checklist

Complete every **REQUIRED** item before enabling public signup.

## REQUIRED — authentication and URLs
- [ ] Supabase **Authentication → Providers → Email → Confirm email** is enabled.
- [ ] Supabase **Authentication → URL Configuration → Site URL** is the stable production PortfolioPath domain.
- [ ] Supabase redirect URLs include the stable production domain and `/auth/confirm` / password-recovery flows as needed.
- [ ] Test signup using a brand-new email: account cannot sign in until the email is confirmed.
- [ ] Test **Forgot password** and **Update password** end to end.
- [ ] Configure custom SMTP for reliable production auth email delivery.

## REQUIRED — server secrets and hosting
When you are actually ready to open the product broadly, generate one long random `BACKEND_SHARED_SECRET` and set the exact same value in:
- [ ] Vercel: `BACKEND_SHARED_SECRET`
- [ ] Render: `BACKEND_SHARED_SECRET`

Also verify:
- [ ] Vercel: `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Vercel: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] Vercel: `SUPABASE_SERVICE_ROLE_KEY` is server-only and never prefixed `NEXT_PUBLIC_`
- [ ] Vercel: `API_BASE_URL=https://portfoliopath-api.onrender.com`
- [ ] Render: `FMP_API_KEY`
- [ ] Render: `APP_ENV=production`
- [ ] Render: `FRONTEND_ORIGIN` equals the stable production frontend origin
- [ ] Rotate any API/service secret that has ever been exposed in chat, source control, screenshots, or client-side environment variables.

## REQUIRED — database/security
- [ ] Supabase RLS is enabled on every user-owned table.
- [ ] Confirm a test user cannot read or modify another test user's portfolios/selections.
- [ ] Run Supabase Security Advisor and resolve critical/high findings.
- [ ] Test account deletion from **Profile → Account controls** using a disposable account.

## REQUIRED — product smoke test
Run this on the production deployment with a fresh account:
- [ ] Home → Learn works before signup.
- [ ] Signup → confirmation email → sign in works.
- [ ] Create Learning Portfolio.
- [ ] Questionnaire completes and explains dividend-producing investments.
- [ ] $100 portfolio produces a simpler learning structure than a $1,000+ portfolio.
- [ ] Model Allocation is clearly labeled educational.
- [ ] Builder supports custom amounts and multiple holdings.
- [ ] Research Relevance copy does not promise returns or suitability.
- [ ] ETF Overlap works for at least one known supported pair such as VOO/QQQ.
- [ ] Unsupported ETF holdings display “unavailable,” never “0% overlap.”
- [ ] Final review, Structure Summary, Alerts, Learn, Profile all load.
- [ ] Removed features (watchlist, journal, practice transactions, performance, live refresh, investment goal, compare) are not exposed.
- [ ] Privacy, Terms, and Disclosures links load.

## REQUIRED — legal/product positioning
- [ ] Public marketing describes PortfolioPath as investing education / simulation, not a service that tells users what to buy.
- [ ] Do not market Research Relevance scores as expected returns, suitability scores, or recommendations.
- [ ] Do not add trade execution, personalized buy/sell/hold instructions, or paid individualized recommendations without a securities-law review.
- [ ] Have a qualified attorney review the final Terms, Privacy Notice, disclosures, and adviser-registration implications before significant commercialization. The included language is a product draft, not a legal opinion.

## Strongly recommended
- [ ] Use a stable custom domain.
- [ ] Add uptime/error monitoring for Vercel and Render.
- [ ] Set Render health check to `/health`.
- [ ] Add a real support/contact channel and publish it in Privacy/Terms.
- [ ] Replace best-effort ETF fallback data with a scheduled first-party/licensed ingestion pipeline as usage grows.
- [ ] Add production analytics that do not collect unnecessary sensitive financial information.
- [ ] Run a 5–10 beginner usability test before broad promotion.
