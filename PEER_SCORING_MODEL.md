# PortfolioPath Peer-Relative Scoring

The scoring model now recognizes that financial ratios cannot be judged fairly with one universal cutoff.

Examples:
- A P/E ratio that looks expensive for a bank may be normal for a software company.
- Operating margins differ structurally across industries.
- Debt is used differently by utilities, REITs, banks, and asset-light technology companies.

## Process
1. Calculate the security's absolute fundamental metrics.
2. Retrieve a comparable-company peer set.
3. Calculate the same metrics for available peers.
4. Convert supported metrics into peer percentiles.
5. Build peer-relative component scores.
6. Blend peer-relative scores with transparent absolute scores.
7. Recalculate Objective Quality and Personalized Portfolio Match.

## Peer-relative metrics
Higher is generally better:
- revenue growth
- EPS growth
- net margin
- operating margin
- free-cash-flow margin
- cash-to-debt

Lower is generally better:
- debt-to-equity
- P/E
- price-to-book
- EV/EBITDA
- historical volatility

## Blending
Peer analysis is used only when at least three peer companies can be scored.

The peer-relative contribution increases with metric coverage but is capped so an imperfect peer group cannot completely override the company's absolute financial condition.

If sufficient peer data is unavailable, PortfolioPath automatically falls back to the fixed-cutoff scoring model.

## Future refinements
- industry-specific metric selection
- separate scoring models for banks, insurers, REITs, and pre-profit companies
- multi-year trend percentiles
- market-cap-aware peers
- ETF-specific scoring rather than company fundamentals
