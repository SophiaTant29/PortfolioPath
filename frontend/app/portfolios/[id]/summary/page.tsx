import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function SummaryPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const supabase=await createClient();
  const {data:portfolio}=await supabase.from("portfolios").select("*").eq("id",id).single();
  const {data:rows}=await supabase.from("portfolio_selections").select("*").eq("portfolio_id",id).order("category");

  if(!portfolio)return <section className="panel">Portfolio not found.<div className="actions" style={{"marginTop":16}}><Link className="btn btnPrimary" href={`/portfolios/${id}/final-review`}>Review My Portfolio</Link></div></section>;
  const target=Number(portfolio.risk_profile?.answers?.amount??0);
  const total=(rows??[]).reduce((s:any,x:any)=>s+Number(x.planned_amount),0);
  const pct=target>0?total/target*100:0;
  const cats:Record<string,number>={};
  (rows??[]).forEach((x:any)=>cats[x.category]=(cats[x.category]??0)+Number(x.planned_amount));

  return (
    <>
      <section className="panel">
        <p className="muted">Portfolio Summary</p>
        <h1>{portfolio.name}</h1>
        <div className="grid">
          <div className="card"><span className="muted">Selected</span><div className="kpi">${total.toLocaleString(undefined,{maximumFractionDigits:0})}</div></div>
          <div className="card"><span className="muted">Target</span><div className="kpi">${target.toLocaleString(undefined,{maximumFractionDigits:0})}</div></div>
          <div className="card"><span className="muted">Completion</span><div className="kpi">{pct.toFixed(0)}%</div></div>
        </div>
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>Selected Investments</h2>
        {(rows??[]).length===0?<p className="muted">No investments selected.</p>:
          (rows??[]).map((x:any)=><div className="card" key={x.id} style={{marginBottom:10}}>
            <strong>{x.symbol} — {x.name}</strong>
            <p className="muted">{x.category} • {x.security_type}</p>
            <div>${Number(x.planned_amount).toLocaleString(undefined,{maximumFractionDigits:0})}</div>
          </div>)}
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>Allocation by Category</h2>
        {Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=><p key={cat}><strong>{cat}</strong> — ${amt.toLocaleString(undefined,{maximumFractionDigits:0})} ({target?((amt/target)*100).toFixed(1):"0"}%)</p>)}
        <div className="actions">
          <Link className="btn btnSecondary" href={`/portfolios/${id}/build?step=0`}>Edit Portfolio</Link>
          <Link className="btn btnSecondary" href={`/portfolios/${id}`}>Return to Portfolio</Link>
          <Link className="btn btnPrimary" href={`/portfolios/${id}/practice`}>Start Practice Mode</Link>
        </div>
      </section>
    </>
  );
}
