# PortfolioPath Change Intelligence

PortfolioPath alerts are designed to reduce noise. A user should not receive an alert because a metric moved slightly.

## Current alert levels

### Information
Examples:
- Match Score improved materially.

### Consider
Examples:
- Match Score fell 5–9 points.
- Quality Score fell 8+ points.
- Estimated security risk rose 12+ points.
- A major scoring component fell 12+ points.
- A holding exceeds roughly 15% of the selected portfolio.
- A category is materially above target.

### Important
Examples:
- Match Score fell 10+ points.
- A holding exceeds roughly 25% of the selected portfolio.
- Portfolio trails its benchmark by 8+ percentage points.
- Maximum drawdown reaches 25% or worse.

## Design principle
Alerts should answer:
> "What changed enough that I should review it?"

They should not answer:
> "What should I buy or sell?"

Every alert links back to research, review, performance, or insights so the user can inspect the reason before making a decision.

## Future improvements
- alerts for fundamentals changing from Improving -> Weakening
- ETF expense-ratio changes
- ETF overlap becoming excessive after a new investment
- goal progress falling behind schedule
- rolling drawdown / volatility alerts
- per-user alert preferences
- email/push delivery only after legal/product review
