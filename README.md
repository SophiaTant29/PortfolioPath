# PortfolioPath Production v1

This is the first deployable application scaffold for PortfolioPath.

## Architecture
- Frontend: Next.js 16 App Router + TypeScript
- Auth / primary database: Supabase Auth + PostgreSQL
- Backend analytics / market data: FastAPI
- Market data: Financial Modeling Prep through the backend only
- Official filings: SEC EDGAR links/API

## Why this split
Supabase owns identity and user-scoped application data. FastAPI owns market-data access,
scoring, portfolio analytics, backtesting, and future scheduled calculations.

## Development setup

### 1. Supabase
Create a Supabase project and run `supabase/schema.sql` in the SQL editor.

### 2. Frontend
Copy `frontend/.env.example` to `frontend/.env.local`, fill in the values, then:

```bash
cd frontend
npm install
npm run dev
```

### 3. Backend
Copy `backend/.env.example` to `backend/.env`, fill in the values, then:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The frontend defaults to http://localhost:3000 and backend to http://127.0.0.1:8000.

## First production milestones
1. Real account sign-up/sign-in
2. Create/read multiple portfolios from Postgres
3. Persist questionnaire profiles
4. Persist transactions and watchlists
5. Pull live research data through FastAPI
6. Calculate performance and benchmark history server-side
7. Replace prototype security scores with peer-relative real scores

## Production v2 added
- Full 15-question investor questionnaire
- Risk tolerance and risk capacity scoring
- Conservative risk-cap rule
- Five investor profiles
- Goal and preference scoring
- Sector tilts and small-cap caps
- Recommended allocation in percentages and dollars
- Supabase persistence of answers and calculated profile
- Create Portfolio -> Questionnaire -> Recommendation workflow

## Production v3 added
- Guided builder that follows the recommended allocation from largest category to smallest
- 25+ investment options in every category
- Search and Stock/ETF filters
- Illustrative personalized Match Scores pending live scoring migration
- Research links into the production research route
- Persistent planned selections in Supabase
- Category allocation / over-allocation monitoring
- Completed portfolio summary

## Production v4 added
- Authenticated Practice Mode
- Persistent BUY / SELL transactions in Supabase
- Transaction dates, shares, prices, fees, symbols, categories, and notes
- Practice cash balance
- Prevention of simulated purchases above available cash
- Prevention of simulated sales above owned share count
- Average cost and open-position calculations
- Optional current-price lookup through the FastAPI backend
- Transaction history page
- Production performance route prepared for the next historical-data migration

## Production v5 added
- Server-side portfolio backtesting in FastAPI
- Historical daily price retrieval for every traded symbol
- S&P 500 historical benchmark retrieval
- Transaction-by-transaction daily portfolio reconstruction
- Current simulated portfolio value
- Total portfolio return
- S&P 500 return over the same period
- Excess return / underperformance
- Maximum drawdown
- Annualized volatility
- Daily performance series
- Production frontend performance chart normalized to growth of $100

## Production v6 added
- Backend Hold / Review / Consider Replacing rules
- Fundamental Change Monitor
- Revenue-growth, profit, debt, and free-cash-flow trend analysis
- Portfolio concentration checks
- Risk-profile fit checks
- Relative-performance checks versus benchmark
- Same-category alternative suggestions
- Production Portfolio Review page

## Production v7 added
- Portfolio Insights center
- Portfolio health summary
- Target-vs-current allocation analysis
- Exact category rebalancing amounts
- Investment goal tracking
- Watchlist management
- Decision journal
- Prioritized next-action suggestions
- Cross-links among Performance, Review, Insights, Watchlist, and Journal

## Production v8 added
- Live backend security scoring
- Financial Strength score
- Profitability score
- Growth score
- Valuation score
- Stability score from historical volatility
- Dividend score
- Momentum score
- Objective Quality Score
- Personalized Portfolio Match Score
- Risk-fit calculation against investor profile
- Research-page live scoring card
- Guided-builder live Match Score calculation
- Match labels explicitly separated from return predictions

## Production v9 added
- Comparable-company peer lookup
- Peer-relative percentile scoring
- Sector/industry-context valuation scoring
- Peer-relative growth, profitability, leverage, stability, and dividend comparisons
- Blended absolute + peer-relative scores
- Peer coverage/confidence reporting
- Automatic fallback when insufficient peers are available
- Research UI percentile context

## Production v10 added
- Dedicated ETF scoring engine
- Diversification score
- Expense-ratio score
- Liquidity score
- Concentration score
- Volatility/stability score
- Fund-size score
- Track-record score
- ETF risk-fit score
- ETF-specific research card
- ETF holdings-overlap analysis
- Pairwise common-holding and shared-weight detection

## Production v11 added
- Auth-protecting Next.js middleware
- Server-only Supabase admin helper
- Market-data TTL cache
- Retry and 429 rate-limit handling
- Security score snapshot persistence schema
- Backend unit tests
- Dockerfiles for frontend/backend
- Docker Compose local setup
- Deployment guide
- Production hardening checklist

## Production v12 added
- Alpha landing/status page
- Portfolio setup progress component
- Missing-state guards across major workflows
- System status page
- Logout route
- Smoke test for backend health
- End-to-end alpha flow documentation
- Comprehensive alpha QA checklist
- Navigation polish for alpha testing

## Production v13 added
- Automatic per-holding return calculation from saved transactions
- Portfolio Review no longer requires manual returns when practice trades exist
- Score snapshots automatically saved from live stock research
- Score snapshots automatically saved from live ETF research
- Benchmark labeling helper
- Additional holding-performance tests
- Better separation between portfolio performance and security review calculations

## Production v14 added
- Change Intelligence engine
- Match Score change alerts
- Quality-score deterioration alerts
- Risk-increase alerts
- Component-level score deterioration alerts
- Concentration alerts
- Category-overweight alerts
- Benchmark-underperformance alerts
- Drawdown alerts
- Dedicated Portfolio Alerts page
- Alert summary API route
- Links from portfolio and insights pages

## Production v15 added
- Responsive mobile polish
- Semantic navigation
- Skip-to-content link
- Stronger keyboard focus states
- Reduced-motion support
- Accessible alert severity badges
- Better progress semantics
- Improved login autocomplete
- Consistent status styles
- UI/UX accessibility checklist
- First alpha deployment plan

## Production v16 added
- Production environment templates
- Release validation script
- Full release-check shell script
- Vercel configuration
- Render backend configuration
- First-run setup guide
- Release-readiness checklist
- Investment disclosures page
- Privacy placeholder page
- Alpha terms page
- Footer legal/status navigation

## Production v17 added
- Real integration/build validation pass
- Next.js 16 `proxy.ts` migration
- Modern ESLint + typecheck scripts
- Fixed ETF scoring endpoint in Guided Builder
- Fixed benchmark selection in Performance
- Automatic performance snapshot persistence
- Performance snapshot schema fields used by Insights/Alerts
- Idempotent RLS policies and transaction constraints
- v17 Supabase migration for existing databases
- Explicit build-validation report

### v17 validation fixes
- Fixed nested score snapshot payload used by Change Intelligence
- React/React DOM declarations aligned to 19.2

## Production v18 added
- True baseline Supabase migration for fresh hosted projects
- Timestamped migration sequence
- Supabase CLI config
- Render dynamic PORT support
- GitHub CI workflow
- Optional Supabase migration deployment workflow
- Hosted frontend/backend smoke-check script
- Migration validation script
- Hosted alpha runbook
- Hosted alpha status report

## Production v19 added
- Playwright browser acceptance framework
- Desktop + mobile browser projects
- Public route smoke tests
- Authenticated alpha flow test scaffold
- Hosted acceptance Python script
- Scheduled/manual hosted acceptance GitHub workflow
- Live alpha acceptance checklist
- Alpha tester guide
- GitHub alpha bug template

## Production v20 added
- Git-ready `.gitignore`
- Safe GitHub bootstrap/publish script
- GitHub repository setup guide
- GitHub publication status report
- Explicit protection against accidentally publishing into unrelated repositories

## Production v21 added
- Category-by-category mini research libraries
- Highest-weighted allocation category always appears first
- Top-ranked starting set with optional browse-all behavior
- Full existing 300+ security universe remains searchable
- Per-category educational guidance
- Explicit “Why it appears” explanation for every candidate
- Guided research pages that explain why each resource exists and what to look for
- Up-to-three security comparison table
- Stock/ETF-specific research paths
- Research checkpoint before portfolio selection

## Production v22 added
- Plain-English comparison tradeoffs
- “What actually matters here?” comparison prompts
- Persistent research/learning checkpoints
- Allocation-weight explanations
- Category completion review gates
- Final portfolio construction review
- Beginner investment glossary
- Reusable in-app term help component
- Alpha beginner usability feedback worksheet

## Production v23 added
- Planned-investment setup before portfolio construction
- Percentage-only mode when the user does not know the dollar amount yet
- Both percentage and dollar targets when an amount is known
- Multiple holdings per allocation category
- Suggested number of holdings per category based on portfolio size and category weight
- Equal-weight educational examples for splitting category allocations
- Explicit separation of category allocation vs. individual position sizing

## Production v24 added
- Inline research-resource panel on every stock/ETF card
- Explicit explanation of why each research source matters
- Beginner-friendly checklist of what to look for at each source
- Different resource guidance for stocks and ETFs
