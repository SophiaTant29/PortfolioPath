# PortfolioPath Build Validation v17

## Validation completed in this environment
- Release structure check: PASS
- Backend pytest suite: PASS (7 tests)
- Python module import/smoke validation: PASS

## Frontend build environment limitation
The local validation runtime could not complete `npm install` within the available execution window, so a true `next build` could not be executed here. This is an environment/dependency-download limitation, not a confirmed successful frontend build.

## Source issues fixed during static integration audit
- migrated Next.js 16 request interception from `middleware.ts` to `proxy.ts`
- aligned React declarations with React 19.2 for the Next.js 16 App Router
- replaced deprecated `next lint` script with ESLint
- added TypeScript typecheck script
- fixed Guided Builder so ETFs call the ETF scoring endpoint rather than the stock endpoint
- fixed score-snapshot payload nesting so component-level change alerts can read saved scores
- fixed Performance page so the saved portfolio benchmark is actually used
- maps legacy `SP500TR` portfolios to dividend-adjusted SPY proxy instead of silently using `^GSPC`
- added benchmark labels that state whether comparison is price-index or dividend-adjusted proxy
- added automatic persistence of performance snapshots
- added missing performance snapshot columns used by Insights and Alerts
- made transaction constraints idempotent
- made RLS policy creation rerunnable in the consolidated schema
- added a migration file for existing v16 databases

## Required final deployment check
On a machine with npm registry access, run:

`sh scripts/run_checks.sh`

Do not mark the frontend release green until typecheck, lint, and `next build` all pass there.
