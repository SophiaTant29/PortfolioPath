import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { compareScoreSnapshots, portfolioStructureAlerts, sortAlerts } from "@/lib/changeIntelligence";
import { largestPosition } from "@/lib/insights";

export default async function AlertsPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params; const supabase=await createClient();
  const [{data:portfolio},{data:selections},{data:snapshots}]=await Promise.all([
    supabase.from("portfolios").select("*").eq("id",id).single(),
    supabase.from("portfolio_selections").select("*").eq("portfolio_id",id),
    supabase.from("security_score_snapshots").select("*").eq("portfolio_id",id).order("created_at",{ascending:false}).limit(250)
  ]);
  if(!portfolio)return <section className="panel"><h1>Portfolio not found</h1></section>;
  const grouped:Record<string,any[]>={}; for(const s of snapshots??[]){grouped[s.symbol]=grouped[s.symbol]??[];grouped[s.symbol].push(s)}
  let alerts:any[]=[]; for(const rows of Object.values(grouped)){alerts.push(...compareScoreSnapshots(rows[0],rows[1]??null,id))}
  alerts.push(...portfolioStructureAlerts(selections??[],portfolio.risk_profile?.allocation??[],null,id));
  const largest=largestPosition(selections??[]);
  if(largest&&largest.pct>15)alerts.push({severity:"Consider",title:"Concentration review signal",body:`${largest.symbol} represents ${largest.pct.toFixed(1)}% of the selected learning portfolio. This is a prompt to study concentration risk, not an instruction to change the position.`,href:`/portfolios/${id}/review`});
  alerts=sortAlerts(alerts);
  const counts={important:alerts.filter(a=>a.severity==="Important").length,review:alerts.filter(a=>a.severity==="Consider").length,info:alerts.filter(a=>a.severity==="Info").length};
  return <>
    <section className="panel">
      <p className="sectionEyebrow">Educational review signals</p><h1>Portfolio Alerts</h1>
      <p>Alerts point out portfolio characteristics or meaningful research-data changes that may be worth learning more about. They are not recommended actions.</p>
      <p className="helpText">Research information is refreshed on a monthly cadence and may be up to 30 days old.</p>
      <div className="grid"><div className="card"><span className="muted">Important review</span><div className="kpi">{counts.important}</div></div><div className="card"><span className="muted">Review</span><div className="kpi">{counts.review}</div></div><div className="card"><span className="muted">Information</span><div className="kpi">{counts.info}</div></div></div>
    </section>
    <section style={{display:"grid",gap:12,marginTop:16}}>{alerts.length===0?<div className="panel"><h2>No review signals right now</h2><p className="muted">PortfolioPath did not find a current portfolio-structure or research-data signal that meets its alert thresholds.</p></div>:alerts.map((a,i)=><div className="panel" key={`${a.title}-${i}`}><div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><div><strong>{a.title}</strong><p className="muted">{a.body}</p></div><span className={`statusBadge ${a.severity==="Important"?"statusImportant":a.severity==="Consider"?"statusConsider":"statusInfo"}`}>{a.severity==="Consider"?"Review":a.severity}</span></div>{a.href&&<Link className="btn btnSecondary" href={a.href}>Learn More</Link>}</div>)}</section>
    <section className="panel" style={{marginTop:16}}><div className="actions"><Link className="btn btnSecondary" href={`/portfolios/${id}/insights`}>Structure Summary</Link><Link className="btn btnSecondary" href={`/portfolios/${id}/overlap`}>ETF Overlap</Link><Link className="btn btnPrimary" href={`/portfolios/${id}`}>Back to Portfolio</Link></div><p className="educationalNotice" style={{marginTop:12}}>Alerts are educational signals only. They do not tell you to buy, sell, hold, add to, reduce, or replace an investment.</p></section>
  </>;
}
