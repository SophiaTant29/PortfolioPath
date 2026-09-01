import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="panel heroPanel">
        <p className="sectionEyebrow">Investing, explained step by step</p>
        <h1>Learn how a diversified portfolio is built.</h1>
        <p>
          PortfolioPath guides new investors through an investor profile, an educational model allocation,
          beginner-friendly research choices, and a final portfolio review—all without placing real trades.
        </p>
        <div className="actions">
          <Link className="btn btnPrimary" href="/login?mode=signup">Get Started</Link>
          <Link className="btn btnSecondary" href="/login">Sign In</Link>
        </div>
      </section>
      <section className="grid" style={{marginTop:16}}>
        <div className="card"><strong>1. Learn your profile</strong><p className="muted">Answer plain-English questions about risk, time horizon, and investing preferences.</p></div>
        <div className="card"><strong>2. Build with guidance</strong><p className="muted">Browse curated stocks and ETFs with beginner filters, explanations, and guided research.</p></div>
        <div className="card"><strong>3. Understand the result</strong><p className="muted">Review diversification, concentration, ETF overlap, and educational alerts.</p></div>
      </section>
    </>
  );
}
