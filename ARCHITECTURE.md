# PortfolioPath production architecture

## Frontend
Next.js App Router owns:
- landing
- authentication UI
- portfolio creation/editing
- questionnaire
- research views
- watchlist/journal UI
- portfolio dashboard
- charts and user-facing explanations

## Supabase
Supabase owns:
- users/authentication
- portfolios
- transactions
- watchlists
- journal entries
- goals/profile JSON
- saved performance snapshots
- row-level access control

Every user-owned table includes `user_id` and RLS policies.

## FastAPI
FastAPI owns:
- market-data credentials
- quote/fundamental/history retrieval
- security scoring
- portfolio analytics
- benchmark calculations
- ETF overlap
- backtesting
- future scheduled refresh jobs

The market-data API key never belongs in browser JavaScript.

## Next migrations from the v14 prototype
1. Questionnaire -> portfolios.risk_profile
2. Portfolio builder -> transactions
3. Watchlist -> watchlist_items
4. Decision journal -> journal_entries
5. Saved history -> performance_snapshots
6. Research page -> FastAPI `/api/security/{symbol}`
7. Automatic backtest -> FastAPI analytics endpoint
8. Hold/Review/Replace -> server-side rules using real data
