# PortfolioPath v30 — Monthly ETF holdings

PortfolioPath no longer calls a paid ETF-holdings API when a user opens ETF Overlap.

## Runtime behavior

- `backend/data/etf_holdings_monthly.json` is the application snapshot.
- `/api/etf/overlap` reads from this file only.
- A fund not present in the snapshot is reported as unavailable; it is never treated as 0% overlap.
- When stored holdings cover less than 50% of a fund's weight, the UI labels the result as a **minimum observed overlap**.
- The API returns the snapshot date so users can see how current the research data is.

## Monthly maintenance

Once per month, replace each covered fund's `holdings` array with a verified issuer/fund-provider holdings snapshot and update `snapshot_date`.

Each holding is stored as:

```json
{"ticker": "AAPL", "weight": 0.07}
```

Weights use decimals, so 7% is `0.07`.

For public launch, expand coverage to every ETF exposed in PortfolioPath's security universe and verify the holdings against issuer materials before changing the snapshot date.
