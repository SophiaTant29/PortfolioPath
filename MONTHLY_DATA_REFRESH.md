# PortfolioPath monthly data refresh

PortfolioPath v27 intentionally avoids a user-triggered real-time refresh button.

## Current behavior
- Guided research pages cache PortfolioPath's in-app market/company response for up to 30 days.
- Backend historical, fundamental, and ETF data caches use a 30-day TTL.
- Builder ranking metrics are treated as a curated educational snapshot rather than real-time market data.
- The UI clearly tells users that PortfolioPath data may be up to 30 days old and is not real-time.

## Monthly maintenance
Once each month:
1. Verify the Financial Modeling Prep API key is still active in Render.
2. Redeploy/restart the Render backend if you want to clear its in-memory cache at the start of the monthly refresh window.
3. Review a sample of stock and ETF research pages to confirm FMP data is loading.
4. If the curated `securityUniverse.ts` ranking metrics are recalibrated, update them in the same monthly release and note the snapshot date in release notes.
5. Push the monthly release to GitHub; Vercel and Render will auto-deploy from `main`.

The app does not claim second-by-second or daily freshness.
