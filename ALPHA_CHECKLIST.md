# PortfolioPath Alpha Checklist

## Account and security
- [ ] Sign up with a new user
- [ ] Verify email if email verification is enabled
- [ ] Sign in
- [ ] Confirm protected routes redirect unauthenticated users
- [ ] Confirm User A cannot access User B's portfolio records
- [ ] Confirm logout works

## Portfolio setup
- [ ] Create portfolio
- [ ] Complete all 15 questionnaire questions
- [ ] Save investor profile
- [ ] View recommended allocation
- [ ] Edit questionnaire and confirm allocation updates

## Builder and research
- [ ] Walk through all allocation categories
- [ ] Save planned investments
- [ ] Reopen builder and confirm selections persist
- [ ] Open stock research
- [ ] Calculate live stock score
- [ ] Open ETF research
- [ ] Calculate live ETF score

## Practice Mode
- [ ] Record BUY
- [ ] Prevent BUY above available cash
- [ ] Record SELL
- [ ] Prevent SELL above owned shares
- [ ] Confirm average cost updates
- [ ] Confirm transaction history persists

## Performance
- [ ] Load historical market data
- [ ] Reconstruct portfolio history
- [ ] Compare with benchmark
- [ ] Validate current value
- [ ] Validate return
- [ ] Validate maximum drawdown
- [ ] Validate volatility
- [ ] Confirm graceful error state when backend is unavailable

## Review
- [ ] Run review for every planned holding
- [ ] Confirm fundamentals load
- [ ] Confirm Hold / Review / Consider Replacing behavior
- [ ] Confirm alternatives remain in the same category

## Insights
- [ ] View target-vs-current allocation
- [ ] Set investment goal
- [ ] Add/remove watchlist item
- [ ] Add journal entry
- [ ] Analyze ETF overlap
- [ ] Confirm recommended actions change with portfolio state

## Production
- [ ] Run backend test suite
- [ ] Run frontend production build
- [ ] Run Docker Compose locally
- [ ] Confirm environment secrets are not client-exposed
- [ ] Confirm CORS only allows production frontend
- [ ] Review data-provider licensing
- [ ] Add legal/privacy/disclosure pages
- [ ] Add monitoring/error reporting
