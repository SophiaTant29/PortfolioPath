import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();

  if(!user){
    return (
      <section className="panel">
        <p className="sectionEyebrow">Learning workspace</p>
        <h1>Welcome to PortfolioPath</h1>
        <p className="muted">Sign in to save learning portfolios across devices.</p>
        <Link className="btn btnPrimary" href="/login">Sign in</Link>
      </section>
    );
  }

  const {data:portfolios}=await supabase
    .from("portfolios")
    .select("id,name,start_date,created_at,risk_profile")
    .order("created_at",{ascending:false});
  const recent=portfolios?.[0];
  const firstName=(user.user_metadata?.full_name||user.email||"there").split(/[ @]/)[0];

  return (
    <>
      <div className="pageHeader" style={{marginBottom:24}}>
        <div>
          <p className="sectionEyebrow">Learning workspace</p>
          <h1>Good to see you, {firstName}.</h1>
          <p className="muted">Continue building your understanding of portfolio construction and investment research.</p>
        </div>
        <div className="actions">
          <Link className="btn btnSecondary" href="/learn">Learning Center</Link>
          <Link className="btn btnPrimary" href="/portfolios/new">Create Learning Portfolio</Link>
        </div>
      </div>

      {recent ? <section className="premiumHero">
        <div className="premiumHeroMain">
          <p className="sectionEyebrow">Continue where you left off</p>
          <h2>{recent.name}</h2>
          <p className="muted">Review your learning model, research categories, and continue building at your own pace.</p>
          <div className="actions"><Link className="btn btnPrimary" href={`/portfolios/${recent.id}`}>Open Portfolio</Link><Link className="btn btnSecondary" href={`/portfolios/${recent.id}/recommendation`}>View Model Allocation</Link></div>
        </div>
        <div className="premiumHeroSide">
          <p className="sectionEyebrow">Learning profile</p>
          <div className="kpi">{recent.risk_profile?.profileName || "In progress"}</div>
          <p className="muted">Illustrative profile for the learning experience.</p>
        </div>
      </section> : null}

      <section className="metricStrip" aria-label="Learning overview">
        <div className="metricItem"><small>Saved portfolios</small><strong>{portfolios?.length ?? 0}</strong></div>
        <div className="metricItem"><small>Learn the basics</small><strong>3 min</strong></div>
        <div className="metricItem"><small>Focus</small><strong>Research first</strong></div>
      </section>

      <div className="sectionEyebrow">Continue learning</div>
      <section className="editorialGrid" style={{marginTop:10}}>
        <div className="editorialCard large">
          <div className="editorialMeta">Featured lesson</div>
          <h2>Learn the Basics</h2>
          <p className="muted">Stocks, ETFs, portfolios, diversification, risk, investment goals, and research — explained before you start building.</p>
          <div className="actions"><Link className="btn btnPrimary" href="/learn/basics">Start 3-Minute Intro</Link></div>
        </div>
        <div style={{display:"grid",gap:16}}>
          <div className="editorialCard"><div className="editorialMeta">Research skill</div><h2>Understand ETF overlap</h2><p className="muted">Learn why different funds can still own many of the same companies.</p><Link href="/learn" style={{color:"var(--accent)",fontWeight:750}}>Explore the concept →</Link></div>
          <div className="editorialCard"><div className="editorialMeta">Reference</div><h2>Beginner glossary</h2><p className="muted">Look up unfamiliar investing terms without leaving the learning flow.</p><Link href="/learn/glossary" style={{color:"var(--accent)",fontWeight:750}}>Open glossary →</Link></div>
        </div>
      </section>

      <section style={{marginTop:28}}>
        <div className="pageHeader"><div><p className="sectionEyebrow">Your workspace</p><h2>Learning portfolios</h2></div></div>
        <div className="grid">
          {(portfolios ?? []).map(p=>(
            <Link key={p.id} href={`/portfolios/${p.id}`} className="card cardInteractive">
              <strong>{p.name}</strong>
              <p className="muted">Learning portfolio · Started {p.start_date}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
