export default function PrivacyPage(){
  return <section className="panel">
    <p className="sectionEyebrow">Privacy</p>
    <h1>Privacy Overview</h1>
    <p>
      PortfolioPath stores account and portfolio information so users can save their questionnaires, portfolios,
      transactions, watchlists, journal entries, and analysis history.
    </p>
    <h2>Account data</h2>
    <p>Authentication and account persistence are handled through Supabase in this alpha architecture.</p>
    <h2>Portfolio data</h2>
    <p>User-owned portfolio records are protected by database Row Level Security policies tied to the authenticated user.</p>
    <h2>Market data</h2>
    <p>Market-data requests are made by the PortfolioPath backend. Provider API credentials are not intended to be exposed to browser clients.</p>
    <h2>Alpha note</h2>
    <p>This page is a product-development placeholder and should be replaced with reviewed production privacy language before public launch.</p>
  </section>;
}
