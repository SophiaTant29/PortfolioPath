# PortfolioPath Product Learning Upgrade — v22

v22 implements the seven product improvements identified after the Guided Research Library work.

## 1. Enhanced side-by-side comparison
Comparisons now include:
- numerical characteristics
- plain-English tradeoffs
- "What actually matters here?" prompts
- different comparison prompts for ETFs, stocks, and mixed comparisons

## 2. Research checkpoint
When a user assigns money to a holding, the builder asks:
- Why are you considering it?
- What is the main risk you found?
- What alternative did you compare?

The checkpoint is saved to `research_checkpoints`.

## 3. Why each category has its weight
Every guided-builder category now explains why its model weight exists and how the investor profile influences that role.

## 4. Category completion review
Before continuing to the next category, the user sees:
- target dollars
- selected dollars
- allocation status
- selected holdings
- research-checkpoint completion

Users cannot continue until selected holdings have completed learning checkpoints.

## 5. Strong final portfolio review
New route:
`/portfolios/[id]/final-review`

It explains:
- what was built
- target vs selected allocation
- largest position
- concentration issues
- research completion
- what the user should be able to explain
- next actions before Practice Mode

## 6. Beginner learning layer
Added:
- reusable glossary data
- `TermHelp` component
- `/learn/glossary`

The glossary covers valuation, risk, diversification, fund costs, drawdowns, and other beginner concepts.

## 7. Beginner usability test
Added:
`/alpha/feedback`

The test asks whether users:
- understood why investments appeared
- knew what to research
- felt taught rather than told what to buy
- felt overwhelmed
- understood comparisons
- understood allocation weights

## Migration
New migration:
`20260826090000_learning_checkpoints.sql`

Apply after the existing v18 migrations.
