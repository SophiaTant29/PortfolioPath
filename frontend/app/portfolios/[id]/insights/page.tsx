import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { allocationByCategory, largestPosition, simpleHealthScore } from "@/lib/insights";

export default async function InsightsPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const supabase=await createClient();
  const [{data:portfolio},{data:selections}]=await Promise.all([
    supabase.from("portfolios").select("*").eq("id",id).single(),
    supabase.from("portfolio_selections").select("*").eq("portfolio_id",id)
  ]);
  if(!portfolio)return <section className="panel">Portfolio not found.</section>;
  if(!portfolio.risk_profile)return <section className="panel"><h1>Complete your investor profile first</h1><Link className="btn btnPrimary" href={`/portfolios/${id}/questionnaire`}>Start Questionnaire</Link></section>;

  const rows=selections??[];
  const targetAllocation=portfolio.risk_profile?.allocation??[];
  const categoryAmounts=allocationByCategory(rows);
  const totalSelected=rows.reduce((s:number,r:any)=>s+Number(r.planned_amount??0),0);
  const base=totalSelected||1;
  const largest=largestPosition(rows);
  const health=simpleHealthScore(rows,null);
  const etfCount=rows.filter((r:any)=>r.security_type==="ETF").length;

  return <>
    <section className="panel">
      <p className="sectionEyebrow">Portfolio learning summary</p>
      <h1>{portfolio.name}</h1>
      <p>Use this page to understand portfolio structure. It describes what you built; it does not tell you what to trade.</p>
      <div className="grid">
        <div className="card"><span className="muted">Structure score</span><div className="kpi">{health}/100</div><p className="helpText">A learning score based on diversification and concentration—not expected performance.</p></div>
        <div className="card"><span className="muted">Largest position</span><div className="kpi" style={{fontSize:20}}>{largest?`${largest.symbol} ${largest.pct.toFixed(1)}%`:"—"}</div></div>
        <div className="card"><span className="muted">ETFs selected</span><div className="kpi">{etfCount}</div></div>
      </div>
    </section>
    <section className="panel" style={{marginTop:16}}>
      <h2>Model allocation vs. what you selected</h2>
      <p className="muted">These labels are descriptive learning signals. “Above” or “below” does not mean you should trade.</p>
      <div style={{display:"grid",gap:10}}>{targetAllocation.map((t:any)=>{
        const current=Number(categoryAmounts[t.name]??0); const currentPct=base>0?current/base*100:0; const delta=currentPct-Number(t.pct);
        const label=Math.abs(delta)<=2?"Near model":delta>0?"Above model":"Below model";
        return <div className="card" key={t.name} style={{display:"grid",gridTemplateColumns:"1.4fr .8fr .8fr .9fr",gap:12,alignItems:"center"}}><strong>{t.name}</strong><span>Model {Number(t.pct).toFixed(1)}%</span><span>Selected {currentPct.toFixed(1)}%</span><span>{label}</span></div>
      })}</div>
    </section>
    <section className="panel" style={{marginTop:16}}>
      <h2>Explore your portfolio</h2>
      <div className="actions"><Link className="btn btnSecondary" href={`/portfolios/${id}/review`}>Portfolio Review</Link><Link className="btn btnSecondary" href={`/portfolios/${id}/overlap`}>ETF Overlap</Link><Link className="btn btnPrimary" href={`/portfolios/${id}/alerts`}>Educational Alerts</Link></div>
    </section>
  </>;
}
