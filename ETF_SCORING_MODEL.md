# PortfolioPath ETF Scoring Model

ETFs are not operating companies, so they should not be scored using P/E, revenue growth, or company balance-sheet metrics.

PortfolioPath now uses a dedicated ETF model.

## Core ETF factors
- Diversification
- Expense ratio
- Liquidity
- Concentration
- Historical volatility
- Fund size
- Track record
- Investor risk fit
- Portfolio category fit

## Diversification
Uses:
- number of holdings
- top-10 holding concentration
- holdings concentration (HHI when available)

## Expense Ratio
Lower fees receive stronger scores.

## Liquidity
Average trading volume is used as a practical liquidity measure.

## Fund Size
Larger funds generally receive stronger operational-liquidity scores, although fund size is not itself an expected-return signal.

## Track Record
Funds with a longer history receive more confidence than newly launched funds.

## ETF Overlap
For two ETFs, PortfolioPath:
1. retrieves underlying holdings
2. finds common tickers
3. sums the minimum portfolio weight shared by both funds
4. reports approximate shared exposure and the largest overlapping holdings

This helps prevent false diversification—for example, owning several ETFs that all have large exposure to the same companies.

## Important
ETF Match is a portfolio-fit and implementation-quality score. It is not a forecast of future fund returns.
