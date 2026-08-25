# PortfolioPath Review Model

The review engine intentionally avoids a simple "price fell -> sell" rule.

Inputs include:
- holding performance versus benchmark
- position concentration
- holding risk versus investor risk profile
- overall portfolio underperformance
- overall drawdown context
- company fundamental trend

## Fundamental trend
The first production version compares:
- revenue growth
- net income change
- debt change
- free cash flow change
- current valuation reference

It classifies the trend as:
- Improving
- Stable
- Weakening

## Review labels
- Hold: few or no meaningful concerns
- Review: one or more material issues deserve attention
- Consider Replacing: several concerns are present at once

A recommendation to "Consider Replacing" is not a prediction that another security will outperform. Alternatives are shown because they fit the same portfolio category and may better match the user's profile.
