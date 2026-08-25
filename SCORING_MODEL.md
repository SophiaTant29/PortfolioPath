# Investor Profile Scoring Model

## Risk tolerance
- Market-drop reaction: 45%
- Volatility comfort: 35%
- Loss-vs-opportunity concern: 20%

## Risk capacity
- Time horizon: 45%
- Emergency savings: 20%
- Unexpected liquidity need: 20%
- Income stability: 15%

## Final risk
PortfolioPath intentionally does not use a simple average.

1. Let `low = min(risk tolerance, risk capacity)`.
2. Let `high = max(risk tolerance, risk capacity)`.
3. Preliminary overall risk = `60% * low + 40% * high`.
4. Final risk cannot exceed `risk capacity + 15`.

This prevents a user who is emotionally comfortable taking high risk from receiving an extremely aggressive allocation when their time horizon or financial flexibility does not support it.

## Profiles
- 0–25: Protect
- 26–45: Cautious
- 46–65: Balanced
- 66–82: Growth
- 83–100: Aggressive Growth

## Base allocations
- Protect: 30% stocks / 45% bonds / 25% short-term
- Cautious: 52% / 32% / 16%
- Balanced: 70% / 20% / 10%
- Growth: 88% / 8% / 4%
- Aggressive Growth: 95% / 3% / 2%

Goal adjustments are then applied, followed by equity-sector allocation, small-cap caps, and small controlled sector-interest tilts.

All scoring is deterministic and explainable. AI should explain the result, not decide the portfolio mathematics.
