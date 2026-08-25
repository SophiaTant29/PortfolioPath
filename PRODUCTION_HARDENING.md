# Production Hardening

## Authentication
Next.js middleware protects portfolio, dashboard, and research routes.
Supabase Row Level Security remains the primary data-isolation layer.

## Market-data resilience
The backend now includes:
- in-memory TTL caching
- short TTL for quotes
- longer TTL for fundamentals and ETF holdings
- exponential-style retries
- 429 rate-limit handling
- backend-only API keys

## Score persistence
A `security_score_snapshots` table can persist score outputs by user, portfolio, symbol, and date.
This supports:
- historical score changes
- faster dashboards
- auditability
- future "what changed?" explanations

## Tests
Initial tests cover:
- portfolio backtesting
- review classification
- peer-score direction
- ETF holdings overlap

These are starter tests, not complete production coverage.

## Remaining hardening
- Redis or managed cache instead of in-process cache
- request tracing / structured logging
- Sentry or equivalent error monitoring
- background score refresh jobs
- database migration tooling
- integration tests
- end-to-end browser tests
- load testing
- abuse/rate limiting at the API gateway
