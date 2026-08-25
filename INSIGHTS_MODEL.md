# PortfolioPath Insights Model

The Insights center is intended to answer one simple question:

> What should I pay attention to next?

It combines:
- original target allocation
- current planned portfolio structure
- latest performance snapshot
- concentration
- goal progress
- watchlist
- decision journal

## Rebalancing
For each category:

`desired dollars = current portfolio base × target percentage`

`difference = desired dollars - current category dollars`

Positive difference -> category is below target.
Negative difference -> category is above target.

Small differences are ignored to avoid unnecessary trading.

## Portfolio Health
The first production health score is deliberately simple:
- concentration penalty
- insufficient category diversification penalty
- large drawdown penalty
- material benchmark-underperformance penalty

This score is descriptive, not predictive.

## Recommended Next Actions
Actions are prioritized when:
- no goal is set
- a single holding is too concentrated
- the portfolio materially trails its benchmark
- drawdown is high

Future versions can add tax-aware rebalancing, ETF overlap, sector look-through, and account-type considerations.
