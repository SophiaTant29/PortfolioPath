# PortfolioPath — Launch-Ready Demo

This package is the polished, launch-ready demonstration build of PortfolioPath.

It is designed to look and behave like the public product while keeping external production operations optional until you are actually ready to open signup broadly.

## Included in this build
- Beginner-first homepage and onboarding
- Visible Learning Center before signup and throughout the workflow
- Email-confirmation messaging and confirmation callback support
- Forgot-password and update-password flows
- Educational Terms, Privacy, and investment-disclosure pages
- 15-question investor-profile exercise with plain-English term help
- Dividend-producing investment explanation in the questionnaire
- Educational Model Allocation language rather than recommendation language
- Amount-aware portfolio complexity so smaller portfolios use fewer holdings/categories
- Guided category-by-category builder with multiple holdings support
- Research Relevance terminology instead of suitability-like scoring language
- Monthly ETF overlap system with graceful secondary-source coverage
- Structure Summary, educational Alerts, final review, Learn, and Profile
- Public-facing routes cleaned of obvious developer/test language
- Optional backend shared-secret protection that can be switched on at real launch

## Demo mode vs. real public launch
The demo works without `BACKEND_SHARED_SECRET`. Before opening the product broadly to the public, set the same long random `BACKEND_SHARED_SECRET` in both Vercel and Render. The existing code will automatically enforce it once configured.

The remaining public-launch steps are operational rather than product-development work: stable domain, Supabase production URLs, email confirmation, custom SMTP, final legal review, security review, and a fresh-user smoke test.

Use `PUBLIC_LAUNCH_CHECKLIST.md` when you decide to actually go live.
