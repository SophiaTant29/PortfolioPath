"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { securityUniverse } from "@/lib/securityUniverse";

const API=process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type HoldingReview={
  ticker:string;
  name:string;
  category:string;
  amount:number;
  status:string;
  weight:number;
  relative_performance:number;
  positives:string[];
  concerns:string[];
  fundamentals?:any;
  alternatives:any[];
};

function fitScore(s:any,rp:any){
  const profile=String(rp?.profileName ?? "Balanced");
  const weights=({
    "Protect":{quality:.30,stability:.30,growth:.05,dividend:.15,risk:.20},
    "Cautious":{quality:.28,stability:.25,growth:.08,dividend:.14,risk:.25},
    "Balanced":{quality:.25,stability:.18,growth:.20,dividend:.08,risk:.29},
    "Growth":{quality:.22,stability:.10,growth:.32,dividend:.04,risk:.32},
    "Aggressive Growth":{quality:.18,stability:.06,growth:.38,dividend:.03,risk:.35},
  } as Record<string,{quality:number;stability:number;growth:number;dividend:number;risk:number}>)[profile] ?? {quality:.25,stability:.18,growth:.20,dividend:.08,risk:.29};
  const targetRisk=Number(rp?.overallRisk ?? 55);
  const riskFit=Math.max(0,100-Math.abs(Number(s.risk)-targetRisk)*1.6);
  return Math.max(1,Math.min(99,Math.round(
    s.quality*weights.quality+s.stability*weights.stability+s.growth*weights.growth+s.dividend*weights.dividend+riskFit*weights.risk
  )));
}

export default function ReviewPage(){
  const params=useParams<{id:string}>();
  const router=useRouter();
  const [portfolio,setPortfolio]=useState<any>(null);
  const [selections,setSelections]=useState<any[]>([]);
  const [performance,setPerformance]=useState<any>(null);
  const [transactions,setTransactions]=useState<any[]>([]);
  const [manualReturns,setManualReturns]=useState<Record<string,number>>({});
  const [reviews,setReviews]=useState<HoldingReview[]>([]);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");

  useEffect(()=>{(async()=>{
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){router.push("/login");return}
    const [{data:p},{data:sels},{data:snaps},{data:txs}] = await Promise.all([
      supabase.from("portfolios").select("*").eq("id",params.id).eq("user_id",user.id).single(),
      supabase.from("portfolio_selections").select("*").eq("portfolio_id",params.id).eq("user_id",user.id),
      supabase.from("performance_snapshots").select("*").eq("portfolio_id",params.id).eq("user_id",user.id).order("snapshot_date",{ascending:false}).limit(1),
      supabase.from("transactions").select("*").eq("portfolio_id",params.id).eq("user_id",user.id).order("trade_date")
    ]);
    setPortfolio(p);
    setSelections(sels??[]);
    setPerformance((snaps??[])[0]??null);
    setTransactions(txs??[]);
    setLoading(false);
  })()},[params.id,router]);

  const total=useMemo(()=>selections.reduce((s,x)=>s+Number(x.planned_amount),0),[selections]);

  async function runReviews(){
    if(!portfolio)return;
    setMessage("Calculating holding returns and reviewing fundamentals…");
    const out:HoldingReview[]=[];
    const benchmark=Number(performance?.benchmark_return??0);
    const investorRisk=Number(portfolio.risk_profile?.overallRisk??55);
    const portfolioExcess=performance?Number(performance.excess_return):null;

    for(const h of selections){
      const meta=securityUniverse.find(s=>s.ticker===h.symbol&&s.category===h.category)
        ?? securityUniverse.find(s=>s.ticker===h.symbol);

      const symbolTxs=transactions
        .filter((t:any)=>t.symbol===h.symbol)
        .map((t:any)=>({
          symbol:t.symbol,
          transaction_type:t.transaction_type,
          trade_date:t.trade_date,
          shares:Number(t.shares),
          price:Number(t.price),
          fees:Number(t.fees||0)
        }));

      let holdingReturn=Number(manualReturns[h.symbol]??0);

      if(symbolTxs.length){
        try{
          const hp=await fetch(`${API}/api/analytics/holding-performance`,{
            method:"POST",
            headers:{"content-type":"application/json"},
            body:JSON.stringify({symbol:h.symbol,transactions:symbolTxs})
          });
          if(hp.ok){
            const hj=await hp.json();
            holdingReturn=Number(hj.holding_return??0);
            setManualReturns(prev=>({...prev,[h.symbol]:holdingReturn}));
          }
        }catch{}
      }

      try{
        const r=await fetch(`${API}/api/analytics/review-holding`,{
          method:"POST",
          headers:{"content-type":"application/json"},
          body:JSON.stringify({
            ticker:h.symbol,
            amount:Number(h.planned_amount),
            portfolio_total:total,
            holding_return:holdingReturn,
            benchmark_return:benchmark,
            holding_risk:Number(meta?.risk??55),
            investor_risk:investorRisk,
            portfolio_excess:portfolioExcess,
            max_drawdown:performance?.max_drawdown==null?null:Number(performance.max_drawdown)
          })
        });
        if(!r.ok)throw new Error();
        const j=await r.json();

        const alternatives=securityUniverse
          .filter(s=>s.category===h.category&&s.ticker!==h.symbol)
          .map(s=>({...s,match:fitScore(s,portfolio.risk_profile)}))
          .sort((a,b)=>b.match-a.match)
          .slice(0,3);

        out.push({
          ticker:h.symbol,
          name:h.name,
          category:h.category,
          amount:Number(h.planned_amount),
          ...j.review,
          fundamentals:j.fundamentals,
          alternatives
        });
      }catch{
        out.push({
          ticker:h.symbol,name:h.name,category:h.category,amount:Number(h.planned_amount),
          status:"Review",weight:total?Number(h.planned_amount)/total*100:0,relative_performance:0,
          positives:[],concerns:["Live review data could not be loaded from the backend."],
          alternatives:securityUniverse.filter(s=>s.category===h.category&&s.ticker!==h.symbol).slice(0,3)
        });
      }
    }
    setReviews(out);
    setMessage("");
  }

  if(loading)return <section className="panel">Loading Portfolio Review…</section>;
  if(!portfolio)return <section className="panel">Portfolio not found.</section>;
  if(!portfolio.risk_profile)return <section className="panel"><h1>Complete your investor profile first</h1><Link className="btn btnPrimary" href={`/portfolios/${params.id}/questionnaire`}>Start Questionnaire</Link></section>;
  if(selections.length===0)return <section className="panel"><h1>Build your portfolio first</h1><Link className="btn btnPrimary" href={`/portfolios/${params.id}/build?step=0`}>Build Portfolio</Link></section>;

  const counts={
    Hold:reviews.filter(r=>r.status==="Hold").length,
    Review:reviews.filter(r=>r.status==="Review").length,
    Replace:reviews.filter(r=>r.status==="Consider Replacing").length
  };

  return (
    <>
      <section className="panel">
        <p className="muted">Portfolio Review</p>
        <h1>{portfolio.name}</h1>
        <p>PortfolioPath combines relative performance, concentration, risk fit, and changes in company fundamentals.</p>
        <div className="grid">
          <div className="card"><span className="muted">Hold</span><div className="kpi">{counts.Hold}</div></div>
          <div className="card"><span className="muted">Review</span><div className="kpi">{counts.Review}</div></div>
          <div className="card"><span className="muted">Consider Replacing</span><div className="kpi">{counts.Replace}</div></div>
        </div>
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>Holding Performance</h2>
        <p className="muted">PortfolioPath now calculates per-holding returns automatically from saved practice transactions when available. Manual values remain available only for planned holdings without transactions.</p>
        <div style={{display:"grid",gap:10}}>
          {selections.map(h=><div className="card" key={h.id} style={{display:"grid",gridTemplateColumns:"1fr 180px",gap:12,alignItems:"center"}}>
            <div><strong>{h.symbol} — {h.name}</strong><div className="muted">{h.category}</div></div>
            <label className="field" style={{margin:0}}>Return %
              <input type="number" step="0.1" value={manualReturns[h.symbol]??0}
                disabled={transactions.some((t:any)=>t.symbol===h.symbol)}
                onChange={e=>setManualReturns(prev=>({...prev,[h.symbol]:Number(e.target.value)}))}/>
            </label>
          </div>)}
        </div>
        <div className="actions"><button className="btn btnPrimary" onClick={runReviews}>Run Portfolio Review</button></div>
        {message&&<p>{message}</p>}
      </section>

      <section style={{marginTop:16,display:"grid",gap:12}}>
        {reviews.map(r=><div className="panel" key={r.ticker}>
          <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
            <div><h2 style={{margin:0}}>{r.ticker} — {r.name}</h2><p className="muted">{r.category} • ${r.amount.toLocaleString()}</p></div>
            <strong>{r.status}</strong>
          </div>

          <div className="grid">
            <div className="card"><span className="muted">Portfolio weight</span><div className="kpi" style={{fontSize:20}}>{Number(r.weight).toFixed(1)}%</div></div>
            <div className="card"><span className="muted">vs. benchmark</span><div className="kpi" style={{fontSize:20}}>{Number(r.relative_performance)>=0?"+":""}{Number(r.relative_performance).toFixed(1)} pts</div></div>
            <div className="card"><span className="muted">Fundamental trend</span><div className="kpi" style={{fontSize:20}}>{r.fundamentals?.status??"—"}</div></div>
          </div>

          {r.positives.length>0 && <div className="card" style={{marginTop:12}}>
            <strong>What is working</strong>
            <ul>{r.positives.map((x,i)=><li key={i}>{x}</li>)}</ul>
          </div>}

          {r.concerns.length>0 && <div className="card" style={{marginTop:12}}>
            <strong>What to review</strong>
            <ul>{r.concerns.map((x,i)=><li key={i}>{x}</li>)}</ul>
          </div>}

          {r.fundamentals && <div className="card" style={{marginTop:12}}>
            <strong>Fundamental Change Monitor</strong>
            <div className="grid" style={{marginTop:10}}>
              <div><span className="muted">Revenue growth</span><p>{r.fundamentals.revenue_growth==null?"—":`${Number(r.fundamentals.revenue_growth).toFixed(1)}%`}</p></div>
              <div><span className="muted">Profit growth</span><p>{r.fundamentals.profit_growth==null?"—":`${Number(r.fundamentals.profit_growth).toFixed(1)}%`}</p></div>
              <div><span className="muted">Free cash flow change</span><p>{r.fundamentals.fcf_change==null?"—":`${Number(r.fundamentals.fcf_change).toFixed(1)}%`}</p></div>
            </div>
          </div>}

          {r.status!=="Hold" && <div className="card" style={{marginTop:12}}>
            <strong>Other options in this category</strong>
            {r.alternatives.map((a:any)=><p key={a.ticker}><strong>{a.ticker}</strong> — {a.name} {a.match?`• ${a.match}% Match`:""}</p>)}
          </div>}
        </div>)}
      </section>

      <section className="panel" style={{marginTop:16}}>
        <div className="actions">
          <Link className="btn btnSecondary" href={`/portfolios/${params.id}/performance`}>Performance</Link>
          <Link className="btn btnSecondary" href={`/portfolios/${params.id}`}>Back to Portfolio</Link>
        </div>
        <p className="muted" style={{marginTop:16}}>These review labels are educational, rule-based signals. They do not predict future returns or guarantee that selling, holding, or replacing an investment will improve results.</p>
      </section>
    </>
  );
}
