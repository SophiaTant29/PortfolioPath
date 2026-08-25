# PortfolioPath End-to-End Alpha Flow

1. User creates an authenticated account.
2. User creates a portfolio.
3. User completes the 15-question investor profile.
4. Deterministic allocation engine calculates risk and target allocation.
5. User enters the guided builder.
6. User researches stocks and ETFs.
7. Backend calculates live stock/ETF Match Scores.
8. User saves planned allocations.
9. User enters Practice Mode and records simulated trades.
10. FastAPI reconstructs historical portfolio performance.
11. Portfolio is compared with the benchmark.
12. Portfolio Review combines performance, concentration, risk fit, and fundamentals.
13. Insights center shows rebalancing needs, goals, journal, watchlist, and next actions.

## Current alpha boundary
PortfolioPath is now feature-complete enough for internal alpha testing.

The next work should prioritize:
- bug fixing
- automated score persistence
- per-holding return automation
- total-return benchmark support
- responsive polish
- accessibility
- legal/disclosure review
- deployment and monitoring
