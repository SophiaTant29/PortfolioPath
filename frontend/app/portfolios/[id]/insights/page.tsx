import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { allocationByCategory, largestPosition, simpleHealthScore } from "@/lib/insights";

export default async function InsightsPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const supabase=await createClient();

  const [{data:portfolio},{data:selections},{data:watchlist},{data:journal},{data:snapshots}] = await Promise.all([
    supabase.from("portfolios").select("*").eq("id",id).single(),
    supabase.from("portfolio_selections").select("*").eq("portfolio_id",id),
    supabase.from("watchlist_items").select("*").eq("portfolio_id",id).order("created_at",{ascending:false}),
    supabase.from("journal_entries").select("*").eq("portfolio_id",id).order("entry_date",{ascending:false}).limit(20),
    supabase.from("performance_snapshots").select("*").eq("portfolio_id",id).order("snapshot_date",{ascending:false}).limit(1),
  ]);

  if(!portfolio)return <section className="panel">Portfolio not found.</section>;
  if(!portfolio.risk_profile)return <section className="panel"><h1>Complete your investor profile first</h1><Link className="btn btnPrimary" href={`/portfolios/${id}/questionnaire`}>Start Questionnaire</Link></section>;

  const latest=(snapshots??[])[0]??null;
  const rows=selections??[];
  const targetAllocation=portfolio.risk_profile?.allocation??[];
  const categoryAmounts=allocationByCategory(rows);
  const totalSelected=rows.reduce((s:any,r:any)=>s+Number(r.planned_amount??0),0);
  const targetAmount=Number(portfolio.risk_profile?.answers?.amount??0);
  const base=totalSelected>0?totalSelected:targetAmount;
  const largest=largestPosition(rows);
  const health=simpleHealthScore(rows,latest);
  const goal=portfolio.goal??null;
  const currentValue=latest?.portfolio_value!=null?Number(latest.portfolio_value):totalSelected;
  const goalProgress=goal?.targetAmount?Math.min(100,currentValue/Number(goal.targetAmount)*100):null;

  const actions:{title:string;body:string;href?:string}[]=[];
  if(!goal?.targetAmount)actions.push({title:"Set an investment goal",body:"Add a target portfolio value and date so PortfolioPath can measure progress."});
  if(largest && largest.pct>15)actions.push({title:"Review concentration",body:`${largest.symbol} represents ${largest.pct.toFixed(1)}% of the selected portfolio.`,href:`/portfolios/${id}/review`});
  if(latest?.excess_return!=null && Number(latest.excess_return)<-5)actions.push({title:"Review underperformance",body:`The portfolio is trailing the benchmark by ${Math.abs(Number(latest.excess_return)).toFixed(1)} percentage points.`,href:`/portfolios/${id}/review`});
  if(latest?.max_drawdown!=null && Number(latest.max_drawdown)<=-20)actions.push({title:"Review downside risk",body:`Maximum drawdown has reached ${Number(latest.max_drawdown).toFixed(1)}%.`,href:`/portfolios/${id}/performance`});
  if(health>=85 && actions.length===0)actions.push({title:"Portfolio looks well aligned",body:"No major portfolio-structure issues are currently detected. Continue monitoring rather than changing investments unnecessarily."});

  return (
    <>
      <section className="panel">
        <p className="muted">Portfolio Insights</p>
        <h1>{portfolio.name}</h1>
        <p>See the portfolio’s current structure, rebalancing needs, goals, research watchlist, and decision history in one place.</p>

        <div className="grid">
          <div className="card"><span className="muted">Portfolio health</span><div className="kpi">{health}/100</div></div>
          <div className="card"><span className="muted">Goal progress</span><div className="kpi">{goalProgress==null?"Not set":`${goalProgress.toFixed(0)}%`}</div></div>
          <div className="card"><span className="muted">Largest position</span><div className="kpi" style={{fontSize:20}}>{largest?`${largest.symbol} ${largest.pct.toFixed(1)}%`:"—"}</div></div>
        </div>
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>Recommended Next Actions</h2>
        {actions.map((a,i)=><div key={i} className="card" style={{marginBottom:10}}>
          <strong>{a.title}</strong>
          <p className="muted">{a.body}</p>
          {a.href&&<Link className="btn btnSecondary" href={a.href}>Review</Link>}
        </div>)}
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>Rebalancing</h2>
        <p className="muted">Positive amounts are below target. Negative amounts are above target.</p>
        <div style={{display:"grid",gap:10}}>
          {targetAllocation.map((t:any)=>{
            const current=Number(categoryAmounts[t.name]??0);
            const currentPct=base>0?current/base*100:0;
            const desired=base*Number(t.pct)/100;
            const diff=desired-current;
            let action="On target";
            if(diff>Math.max(50,base*.01))action=`Add $${diff.toLocaleString(undefined,{maximumFractionDigits:0})}`;
            else if(diff<-Math.max(50,base*.01))action=`Reduce $${Math.abs(diff).toLocaleString(undefined,{maximumFractionDigits:0})}`;
            return <div className="card" key={t.name} style={{display:"grid",gridTemplateColumns:"1.4fr .7fr .7fr .9fr",gap:12,alignItems:"center"}}>
              <strong>{t.name}</strong>
              <span>Target {Number(t.pct).toFixed(1)}%</span>
              <span>Current {currentPct.toFixed(1)}%</span>
              <span>{action}</span>
            </div>
          })}
        </div>
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>Investment Goal</h2>
        {goal?.targetAmount
          ? <>
              <p><strong>${currentValue.toLocaleString(undefined,{maximumFractionDigits:0})}</strong> of ${Number(goal.targetAmount).toLocaleString(undefined,{maximumFractionDigits:0})}{goal.targetDate?` by ${goal.targetDate}`:""}</p>
              <div style={{height:12,background:"#edf0f4",borderRadius:999,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${goalProgress??0}%`,background:"#1f6feb"}}/>
              </div>
            </>
          : <p className="muted">No investment goal has been set yet.</p>}
        <div className="actions"><Link className="btn btnSecondary" href={`/portfolios/${id}/goal`}>{goal?.targetAmount?"Edit Goal":"Set Goal"}</Link></div>
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>Watchlist</h2>
        {(watchlist??[]).length===0?<p className="muted">No watchlist items yet.</p>:(watchlist??[]).map((w:any)=><div className="card" key={w.id} style={{marginBottom:10}}>
          <strong>{w.symbol} — {w.name}</strong><p className="muted">{w.category}</p>
          <Link className="btn btnSecondary" href={`/research/${w.symbol}?portfolio=${id}`}>Research</Link>
        </div>)}
        <div className="actions"><Link className="btn btnSecondary" href={`/portfolios/${id}/watchlist`}>Manage Watchlist</Link></div>
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>Decision Journal</h2>
        {(journal??[]).length===0?<p className="muted">No journal entries yet.</p>:(journal??[]).map((j:any)=><div className="card" key={j.id} style={{marginBottom:10}}>
          <strong>{j.symbol} — {j.action}</strong>
          <p className="muted">{j.entry_date} • {j.confidence} confidence</p>
          <p>{j.reason}</p>
        </div>)}
        <div className="actions"><Link className="btn btnSecondary" href={`/portfolios/${id}/journal`}>Add Journal Entry</Link></div>
      </section>

      <section className="panel" style={{marginTop:16}}>
        <div className="actions">
          <Link className="btn btnSecondary" href={`/portfolios/${id}/performance`}>Performance</Link>
          <Link className="btn btnSecondary" href={`/portfolios/${id}/review`}>Portfolio Review</Link>
          <Link className="btn btnSecondary" href={`/portfolios/${id}/overlap`}>ETF Overlap</Link>
          <Link className="btn btnSecondary" href={`/portfolios/${id}/alerts`}>Alerts</Link>
          <Link className="btn btnPrimary" href={`/portfolios/${id}`}>Back to Portfolio</Link>
        </div>
      </section>
    </>
  );
}
