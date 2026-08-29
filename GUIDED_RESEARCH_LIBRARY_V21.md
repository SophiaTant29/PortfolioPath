# PortfolioPath Guided Research Library — v21

## Product flow

PortfolioPath now treats each allocation category as a mini research library:

**Allocation category → ranked options → why each appears → guided research → compare alternatives → user chooses → next category**

## Builder behavior

1. Allocation categories are sorted from highest target weight to lowest.
2. The user enters the highest-weighted category first.
3. The page explains the role of that category and the questions that matter.
4. The full security universe for that category is available.
5. The first view shows the top eight ranked candidates to reduce beginner overload.
6. The user can browse all candidates, search, or filter by Stock / ETF.
7. Every candidate explains why it appears.
8. The user can compare up to three alternatives.
9. The user can open a dedicated Guided Research page.
10. The user enters a planned amount and continues to the next category.

## Research page behavior

Every resource now explains:
- **Why it is here**
- **What to look for**

Research resources differ for stocks and ETFs.

### Stocks
- Investor relations
- SEC filings
- Financial trends
- Valuation and peers
- Price / historical behavior

### ETFs
- Official fund page / prospectus
- SEC filings
- Price / historical behavior
- PortfolioPath overlap and comparison

## Important design principle

Rankings are intended to narrow the research universe, not replace research.

The app explicitly says:
- Fit is not an expected-return forecast.
- Historical prices do not predict future returns.
- The user should compare alternatives before selecting.
- A user should be able to explain the investment's role, risks, and differences from peers before adding it.

## Universe size

The existing PortfolioPath universe already provides roughly 25–28 candidates in most equity categories, plus dedicated bond and short-term ETF libraries. The interface is designed to support larger universes later without overwhelming beginners because it defaults to a short ranked starting set.
