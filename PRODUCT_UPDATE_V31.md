# PortfolioPath v31 — ETF overlap coverage fallback

v31 fixes the remaining failure mode exposed by ETFs such as JNK, IUSV, and VCSH.

- The checked-in monthly PortfolioPath ETF holdings snapshot remains the preferred source.
- If a selected ETF is missing from that snapshot, the backend now attempts a top-holdings fallback through `yfinance` and caches the result for 30 days.
- Financial Modeling Prep's premium ETF-holdings endpoint is still not required.
- Missing data is never interpreted as 0% overlap.
- The overlap page identifies which source was used for each ETF.
- Top-holdings-only comparisons continue to be labeled as minimum observed overlap rather than total overlap.

Important: the fallback is best-effort and may be limited by the upstream source. For a larger public launch, PortfolioPath should eventually maintain a first-party scheduled holdings ingestion pipeline from licensed/official issuer data.
