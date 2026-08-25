import Link from "next/link";

export default function Home() {
  return (
    <section className="panel">
      <p className="muted">Your goals first. Your portfolio second.</p>
      <h1>Build, practice, track, and improve your investing decisions.</h1>
      <p>
        PortfolioPath guides beginner investors from an investor profile to a diversified
        portfolio, then helps them research holdings, practice decisions, and review performance.
      </p>
      <div className="actions">
        <Link className="btn btnPrimary" href="/login">Sign in</Link>
        <Link className="btn btnSecondary" href="/dashboard">View app shell</Link>
      </div>
    </section>
  );
}
