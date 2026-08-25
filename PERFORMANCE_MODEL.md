# PortfolioPath Performance Model

The production performance engine reconstructs portfolio value from the user's actual saved practice transactions.

For each historical date:
1. Apply all BUY, SELL, and DIVIDEND transactions dated on or before that day.
2. Track remaining cash.
3. Value every open position using the latest available historical price on or before that date.
4. Portfolio value = cash + market value of open positions.
5. Compare that value with the S&P 500 over the same measurement period.

## Metrics

### Total return
`current portfolio value / starting practice capital - 1`

### Benchmark return
The S&P 500 is normalized from the same starting date.

### Excess return
`portfolio return - benchmark return`

### Maximum drawdown
Largest percentage decline from a previous portfolio-value peak.

### Annualized volatility
Population standard deviation of daily portfolio returns multiplied by `sqrt(252)`.

## Future upgrade
For production-grade benchmarking, PortfolioPath should use an S&P 500 total-return series rather than a price-only index whenever licensing/data-provider support allows it.


## Production v13 benchmark note

PortfolioPath now distinguishes between:
- a benchmark comparison used for portfolio-level performance, and
- per-holding return calculations used by Portfolio Review.

The benchmark should ultimately use a total-return benchmark or an investable dividend-adjusted proxy when the data license permits. Until then, the UI and documentation should avoid implying that a price-only benchmark includes dividends.
