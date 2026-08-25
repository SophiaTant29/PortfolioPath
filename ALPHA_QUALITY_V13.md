# PortfolioPath Alpha Quality v13

## Automated per-holding returns
Portfolio Review can now calculate each holding's return from the user's saved practice transactions and latest available market price.

This removes a major manual step from the alpha workflow.

## Score history
Live stock and ETF research now attempts to save a score snapshot to Supabase after a successful score calculation.

This enables future features such as:
- "Match Score changed from 84% to 79%"
- "Valuation weakened while profitability improved"
- score-history charts
- review audit trails

Snapshot saving is non-blocking. If persistence fails, the user can still continue researching.

## Review behavior
If a holding has transactions:
- automatic return is used
- manual return input is disabled

If a holding is planned but has no transaction:
- manual return can still be entered for testing

## Benchmark clarity
The codebase now has a benchmark-label helper and documentation differentiating price-index benchmarking from total-return benchmarking.
