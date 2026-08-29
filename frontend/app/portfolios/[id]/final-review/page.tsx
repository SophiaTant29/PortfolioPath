import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function FinalPortfolioReview({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return <section className="panel"><p>Please sign in.</p></section>;

  const [{data:p},{data:selections},{data:checks}] = await Promise.all([
    supabase.from("portfolios").select("*").eq("id",id).eq("user_id",user.id).single(),
    supabase.from("portfolio_selections").select("*").eq("portfolio_id",id).eq("user_id",user.id),
    supabase.from("research_checkpoints").select("*").eq("portfolio_id",id).eq("user_id",user.id)
  ]);

  const allocation=p?.risk_profile?.allocation??[];
  const chosen=selections??[];
  const total=chosen.reduce((s:number,x:any)=>s+Number(x.planned_amount??0),0);
  const categories=allocation.map((a:any)=>{
    const actual=chosen.filter((x:any)=>x.category===a.name).reduce((s:number,x:any)=>s+Number(x.planned_amount??0),0);
    return {...a,actual,diff:actual-Number(a.dollars??0)};
  });
  const largest=[...chosen].sort((a:any,b:any)=>Number(b.planned_amount)-Number(a.planned_amount))[0];
  const largestPct=total && largest ? Number(largest.planned_amount)/total*100 : 0;
  const completedChecks=(checks??[]).filter((x:any)=>x.reason&&x.main_risk).length;

  return (
    <>
      <section className="panel">
        <p className="muted">Portfolio construction complete</p>
        <h1>What did you build?</h1>
        <p>This review explains how your choices line up with the model allocation, where concentration exists, and what you should monitor next.</p>
        <div className="grid">
          <div className="card"><span className="muted">Planned portfolio</span><div className="kpi">${total.toLocaleString(undefined,{maximumFractionDigits:0})}</div></div>
          <div className="card"><span className="muted">Holdings</span><div className="kpi">{chosen.length}</div></div>
          <div className="card"><span className="muted">Research checkpoints</span><div className="kpi">{completedChecks}/{chosen.length}</div></div>
          <div className="card"><span className="muted">Largest position</span><div className="kpi" style={{fontSize:20}}>{largest?.symbol??"—"} {largestPct?`${largestPct.toFixed(1)}%`:""}</div></div>
        </div>
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>Target vs. what you built</h2>
        <div style={{overflowX:"auto"}}>
          <table className="comparisonTable">
            <thead><tr><th>Category</th><th>Target</th><th>Selected</th><th>Difference</th><th>Status</th></tr></thead>
            <tbody>{categories.map((c:any)=>{
              const pctDiff=Number(c.dollars)?Math.abs(c.diff)/Number(c.dollars):0;
              const status=pctDiff<=.05?"On target":pctDiff<=.10?"Close":"Review";
              return <tr key={c.name}>
                <td><strong>{c.name}</strong></td>
                <td>${Number(c.dollars).toLocaleString(undefined,{maximumFractionDigits:0})}</td>
                <td>${Number(c.actual).toLocaleString(undefined,{maximumFractionDigits:0})}</td>
                <td>{c.diff>=0?"+":""}${Number(c.diff).toLocaleString(undefined,{maximumFractionDigits:0})}</td>
                <td>{status}</td>
              </tr>
            })}</tbody>
          </table>
        </div>
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>Where should you pay attention?</h2>
        <ul>
          <li>{largestPct>15 ? `Your largest position is ${largest?.symbol} at ${largestPct.toFixed(1)}%, which creates meaningful single-position concentration.` : "No single planned position exceeds the strongest concentration warning threshold."}</li>
          <li>{completedChecks<chosen.length ? `${chosen.length-completedChecks} selected holding(s) do not yet have a completed research checkpoint.` : "Every selected holding has a completed learning checkpoint."}</li>
          <li>Review ETF overlap before using multiple funds that may own many of the same securities.</li>
          <li>Use Performance and Alerts later to monitor changes rather than reacting to short-term price moves alone.</li>
        </ul>
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>What should you be able to explain?</h2>
        <ol>
          <li>Why each allocation category is in the portfolio.</li>
          <li>Why you selected each investment instead of at least one alternative.</li>
          <li>Where your biggest concentration risk is.</li>
          <li>Which fundamental or portfolio changes would make you review a holding.</li>
        </ol>
        <div className="actions">
          <Link className="btn btnSecondary" href={`/portfolios/${id}/overlap`}>Check ETF overlap</Link>
          <Link className="btn btnPrimary" href={`/portfolios/${id}/practice`}>Enter Practice Mode</Link>
        </div>
      </section>
    </>
  );
}
