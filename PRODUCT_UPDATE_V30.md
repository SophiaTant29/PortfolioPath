# PortfolioPath v30 — ETF Overlap Infrastructure Fix

## Fixed
- Removed the runtime dependency on paid FMP ETF-holdings calls.
- Added `backend/data/etf_holdings_monthly.json` as the monthly ETF holdings snapshot.
- Added a local ETF holdings store used by overlap and ETF scoring.
- Unsupported funds are reported as unavailable rather than treated as zero-overlap funds.
- Partial datasets are labeled **minimum observed overlap**.
- The UI displays the holdings snapshot date and coverage notes.
- Added restricted CORS support for PortfolioPath Vercel deployment URLs so preview/deployment hostnames can call Render without changing the backend origin every release.

## Validation
- Release check passes.
- Python compilation passes.
- 12 backend tests pass.
- VOO vs QQQ was exercised through the API and returned a valid overlap result.
- CORS preflight test passes for a PortfolioPath Vercel deployment URL and rejects an unrelated Vercel origin.

## Before public launch
Expand the local monthly ETF holdings snapshot to every ETF offered in the product and refresh it from verified issuer data each month.
