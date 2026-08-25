# PortfolioPath Live Alpha Acceptance

Use this after Vercel, Supabase, and the FastAPI service are deployed.

## Automated hosted checks
Set:

```bash
export FRONTEND_URL=https://YOUR-APP
export API_URL=https://YOUR-API
python scripts/acceptance_hosted.py
```

Expected:
- frontend root responds
- login responds
- disclosures/privacy/terms respond
- system status responds
- backend `/health` returns `status=ok`
- market-data configuration reports enabled

## Browser acceptance
From `frontend/`:

```bash
E2E_BASE_URL=https://YOUR-APP \
E2E_USER_EMAIL=tester@example.com \
E2E_USER_PASSWORD='...' \
npm run test:e2e
```

The public test suite validates:
- authentication screen
- status screen
- legal pages
- protected-route redirect

The authenticated suite validates:
- sign-in
- alpha landing
- entry into portfolio creation

## Manual full-workflow acceptance
After automated checks pass:

1. Create a new portfolio.
2. Complete all 15 investor-profile questions.
3. Confirm the risk profile and allocation are saved.
4. Enter the guided builder.
5. Research one stock and one ETF.
6. Confirm live Match Scores load.
7. Confirm score snapshots are persisted.
8. Save planned allocations.
9. Record a simulated BUY.
10. Verify cash changes.
11. Open Performance and run backtest.
12. Confirm performance snapshot persistence.
13. Open Portfolio Review.
14. Confirm automatic holding return is used.
15. Open Insights and confirm rebalancing amounts.
16. Set a goal.
17. Add a watchlist item.
18. Add a journal entry.
19. Run ETF overlap with at least two ETFs.
20. Open Alerts and confirm score/portfolio changes are surfaced.
21. Log out.
22. Log back in and confirm persistence.

## Cross-user security acceptance
Repeat with User A and User B.

User A must never be able to:
- read User B portfolios
- mutate User B portfolios
- view User B transactions
- view User B score snapshots
- view User B journal/watchlist records

This should be verified with the browser and directly against the Supabase API during alpha QA.

## Pass criteria
The hosted alpha is ready for invite-only testing only when:
- automated hosted checks pass
- browser smoke checks pass
- full workflow passes
- cross-user isolation passes
- no secret is exposed client-side
