import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { compareScoreSnapshots, portfolioStructureAlerts, sortAlerts } from "@/lib/changeIntelligence";

export default async function AlertsPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const supabase=await createClient();

  const [
    {data:portfolio},
    {data:selections},
    {data:snapshots}
  ]=await Promise.all([
    supabase.from("portfolios").select("*").eq("id",id).single(),
    supabase.from("portfolio_selections").select("*").eq("portfolio_id",id),
    supabase.from("security_score_snapshots").select("*").eq("portfolio_id",id).order("created_at",{ascending:false}).limit(250)
  ]);

  if(!portfolio)return <section className="panel"><h1>Portfolio not found</h1></section>;

  const grouped:Record<string,any[]>={};
  for(const s of snapshots??[]){
    grouped[s.symbol]=grouped[s.symbol]??[];
    grouped[s.symbol].push(s);
  }

  let alerts:any[]=[];
  for(const [symbol,rows] of Object.entries(grouped)){
    const current=rows[0];
    const previous=rows[1]??null;
    alerts.push(...compareScoreSnapshots(current,previous,id));
  }

  alerts.push(...portfolioStructureAlerts(
    selections??[],
    portfolio.risk_profile?.allocation??[],
    null,
    id
  ));

  alerts=sortAlerts(alerts);

  const counts={
    important:alerts.filter(a=>a.severity==="Important").length,
    consider:alerts.filter(a=>a.severity==="Consider").length,
    info:alerts.filter(a=>a.severity==="Info").length
  };

  return <>
    <section className="panel">
      <p className="muted">Change Intelligence</p>
      <h1>Portfolio Alerts</h1>
      <p>PortfolioPath compares recent score snapshots and portfolio structure to surface only changes that may deserve attention.</p>
      <div className="grid">
        <div className="card"><span className="muted">Important</span><div className="kpi">{counts.important}</div></div>
        <div className="card"><span className="muted">Consider</span><div className="kpi">{counts.consider}</div></div>
        <div className="card"><span className="muted">Information</span><div className="kpi">{counts.info}</div></div>
      </div>
    </section>

    <section style={{display:"grid",gap:12,marginTop:16}}>
      {alerts.length===0
        ? <div className="panel"><h2>No meaningful changes detected</h2><p className="muted">PortfolioPath did not find any recent changes that meet the current alert thresholds.</p></div>
        : alerts.map((a,i)=><div className="panel" key={`${a.title}-${i}`}>
            <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
              <div><strong>{a.title}</strong><p className="muted">{a.body}</p></div>
              <span className={`statusBadge ${a.severity==="Important"?"statusImportant":a.severity==="Consider"?"statusConsider":"statusInfo"}`} aria-label={`Alert severity ${a.severity}`}>{a.severity}</span>
            </div>
            {a.href&&<Link className="btn btnSecondary" href={a.href}>Review</Link>}
          </div>)}
    </section>

    <section className="panel" style={{marginTop:16}}>
      <div className="actions">
        <Link className="btn btnSecondary" href={`/portfolios/${id}/insights`}>Insights</Link>
        <Link className="btn btnSecondary" href={`/portfolios/${id}/review`}>Portfolio Review</Link>
        <Link className="btn btnPrimary" href={`/portfolios/${id}`}>Back to Portfolio</Link>
      </div>
      <p className="muted" style={{marginTop:12}}>Alerts are educational signals, not instructions to trade. A change in score can reflect market prices, financial data, peer comparisons, or portfolio context.</p>
    </section>
  </>;
}
