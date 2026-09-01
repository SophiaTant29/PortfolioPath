# PortfolioPath v28 — Beginner Learning UX

This release simplifies PortfolioPath around education and removes features that implied live portfolio management.

## Removed
- View App Shell start-page shortcut
- Investment Goal page and goal-progress UI
- Watchlist
- Decision Journal
- Recommended Actions panel

## Changed
- Primary navigation is now Home / My Portfolios / Learn / Profile.
- Persistent education-only disclaimer added.
- “Recommended Allocation” is presented as an Educational Model Allocation.
- Builder cards explain what each security is, why it appears, diversification level, risk, research questions, and a Category Fit score.
- Beginner filters expanded.
- Diversified ETFs receive a “Beginner starting point” label.
- Final review is simplified around what was built, diversification, concentration, learning takeaways, and ETF overlap.
- Profile now includes account summary, saved portfolios, time horizon, experience level, interface mode, questionnaire reset/edit path, and sign out.
- “Recommended actions” are replaced by neutral educational review signals under Alerts.
- Rebalancing language is descriptive (above/below model) rather than instructional.

## ETF overlap fix
- Accepts multiple provider payload shapes.
- Handles missing data for one ETF without crashing the full comparison.
- Reports data coverage and warnings.
- UI clearly states monthly data cadence and educational purpose.
