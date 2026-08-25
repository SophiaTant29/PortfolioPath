# PortfolioPath Security Scoring Model

PortfolioPath now separates two concepts:

## Objective Quality Score
A security-level score that does not depend on the user.

Current stock weights:
- Financial Strength: 30%
- Profitability: 25%
- Growth: 20%
- Valuation: 15%
- Stability: 10%

## Personalized Portfolio Match
A user-specific score based on:
- investor profile
- investor risk level
- security financial strength
- profitability
- growth
- valuation
- stability
- dividend profile
- momentum where appropriate
- estimated security risk

The Match Score is **not an expected-return forecast**.

## Current raw inputs

### Financial Strength
Uses:
- debt-to-equity
- cash relative to debt
- free-cash-flow margin

### Profitability
Uses:
- net margin
- operating margin
- free-cash-flow margin

### Growth
Uses:
- revenue growth
- EPS growth

### Valuation
Uses available:
- P/E
- price-to-book
- EV/EBITDA

### Stability
Uses annualized historical price volatility.

### Dividend
Uses:
- dividend yield
- payout ratio

### Momentum
Uses historical price return over the available history window.

## Important production limitation
The current version uses transparent fixed cutoffs. The next scoring improvement should rank valuation, growth, profitability, and leverage **relative to sector/industry peers**, because a reasonable P/E or margin differs significantly by industry.
