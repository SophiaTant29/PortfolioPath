# PortfolioPath v23 — Investment Amounts, Percentages, and Multiple Holdings

## 1. Ask how much the user plans to invest
A new setup page asks for a planned investment amount.

If the user enters an amount, PortfolioPath shows both:
- allocation percentage
- target dollar amount

Example:
- Broad U.S. Market: 34%
- $10,000 portfolio
- target = $3,400

## 2. Allow percentage-only mode
If the user does not know how much they will invest, they can select:
**“I’m not sure how much I’ll invest yet.”**

The builder then uses percentages instead of dollars.

The user can add a dollar amount later.

## 3. Multiple holdings per category
Users are no longer encouraged to choose only one investment per classification.

A category may contain multiple selected stocks and/or ETFs.

Example:
Technology — 13% total
- MSFT 5%
- NVDA 4%
- AAPL 4%

## 4. Suggested holding count
PortfolioPath estimates a reasonable number of holdings for each category based on:
- total planned investment
- category weight
- whether the user prefers funds or individual stocks

This is explicitly presented as a diversification guideline, not a requirement.

## 5. Equal-weight educational suggestion
If dollar amount is known, PortfolioPath can show:
> If you used equal weights, this would be about $X per holding.

If percentage-only:
> With 3 equal-weight holdings, each would be about 4.3% of the total portfolio.

Users can still choose unequal weights.

## 6. Why this is better
This design separates three different decisions:
1. How much of the portfolio belongs in this category?
2. How many holdings should the user consider within the category?
3. How should the category weight be divided among those holdings?

That is closer to how real portfolio construction works and avoids implying that one category should equal one security.
