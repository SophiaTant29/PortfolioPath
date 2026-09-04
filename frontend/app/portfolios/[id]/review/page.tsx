"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { securityUniverse } from "@/lib/securityUniverse";

type HoldingReview={ticker:string;name:string;category:string;amount:number;status:string;weight:number;positives:string[];concerns:string[];fundamentals?:any;alternatives:any[]};

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
  return Math.max(1,Math.min(99,Math.round(s.quality*weights.quality+s.stability*weights.stability+s.growth*weights.growth+s.dividend*weights.dividend+riskFit*weights.risk)));
}

export default function ReviewPage(){
  const params=useParams<{id:string}>();
  const router=useRouter();
  const [portfolio,setPortfolio]=useState<any>(null);
  const [selections,setSelections]=useState<any[]>([]);
  const [reviews,setReviews]=useState<HoldingReview[]>([]);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");

  useEffect(()=>{(async()=>{
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){router.push("/login");return}
    const [{data:p},{data:sels}] = await Promise.all([
      supabase.from("portfolios").select("*").eq("id",params.id).eq("user_id",user.id).single(),
      supabase.from("portfolio_selections").select("*").eq("portfolio_id",params.id).eq("user_id",user.id)
    ]);
    setPortfolio(p); setSelections(sels??[]); setLoading(false);
  })()},[params.id,router]);

  const total=useMemo(()=>selections.reduce((s,x)=>s+Number(x.planned_amount),0),[selections]);

  async function runReviews(){
    if(!portfolio)return;
    setMessage("Reviewing portfolio structure and company fundamentals…");
    const out:HoldingReview[]=[];
    const investorRisk=Number(portfolio.risk_profile?.overallRisk??55);
    for(const h of selections){
      const meta=securityUniverse.find(s=>s.ticker===h.symbol&&s.category===h.category) ?? securityUniverse.find(s=>s.ticker===h.symbol);
      try{
        const r=await fetch(`/api/backend/api/analytics/review-holding`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
          ticker:h.symbol,amount:Number(h.planned_amount),portfolio_total:total,holding_return:0,benchmark_return:0,holding_risk:Number(meta?.risk??55),investor_risk:investorRisk,portfolio_excess:null,max_drawdown:null
        })});
        if(!r.ok)throw new Error();
        const j=await r.json();
        const alternatives=securityUniverse.filter(s=>s.category===h.category&&s.ticker!==h.symbol).map(s=>({...s,match:fitScore(s,portfolio.risk_profile)})).sort((a,b)=>b.match-a.match).slice(0,3);
        out.push({ticker:h.symbol,name:h.name,category:h.category,amount:Number(h.planned_amount),...j.review,fundamentals:j.fundamentals,alternatives});
      }catch{
        out.push({ticker:h.symbol,name:h.name,category:h.category,amount:Number(h.planned_amount),status:"Review",weight:total?Number(h.planned_amount)/total*100:0,positives:[],concerns:["Monthly fundamental review data could not be loaded."],alternatives:securityUniverse.filter(s=>s.category===h.category&&s.ticker!==h.symbol).slice(0,3)});
      }
    }
    setReviews(out); setMessage("");
  }

  if(loading)return <section className="panel">Loading Portfolio Review…</section>;
  if(!portfolio)return <section className="panel">Portfolio not found.</section>;
  if(!portfolio.risk_profile)return <section className="panel"><h1>Complete your investor profile first</h1><Link className="btn btnPrimary" href={`/portfolios/${params.id}/questionnaire`}>Start Questionnaire</Link></section>;
  if(selections.length===0)return <section className="panel"><h1>Build your portfolio first</h1><Link className="btn btnPrimary" href={`/portfolios/${params.id}/build?step=0`}>Build Portfolio</Link></section>;

  const counts={Steady:reviews.filter(r=>r.status==="Hold").length,Review:reviews.filter(r=>r.status==="Review").length,DeepDive:reviews.filter(r=>r.status==="Consider Replacing").length};
  const displayStatus=(status:string)=>status==="Hold"?"No major research flag":status==="Consider Replacing"?"Deeper research flag":"Review flag";
  return <>
    <section className="panel">
      <p className="muted">Portfolio Review</p><h1>{portfolio.name}</h1>
      <p>Study concentration, risk-profile comparison, and company fundamentals without turning the review into a trading recommendation.</p><p className="educationalNotice">Review labels describe research attention only. They are not buy, sell, hold, or replacement recommendations.</p>
      <p className="helpText">Fundamental information is intended to refresh on a monthly cadence and may be up to 30 days old.</p>
      <div className="grid"><div className="card"><span className="muted">No major research flag</span><div className="kpi">{counts.Steady}</div></div><div className="card"><span className="muted">Review flags</span><div className="kpi">{counts.Review}</div></div><div className="card"><span className="muted">Deeper research flags</span><div className="kpi">{counts.DeepDive}</div></div></div>
      <div className="actions"><button className="btn btnPrimary" onClick={runReviews}>Run Portfolio Review</button></div>{message&&<p>{message}</p>}
    </section>
    <section style={{marginTop:16,display:"grid",gap:12}}>
      {reviews.map(r=><div className="panel" key={r.ticker}>
        <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><div><h2 style={{margin:0}}>{r.ticker} — {r.name}</h2><p className="muted">{r.category} • ${r.amount.toLocaleString()}</p></div><strong>{displayStatus(r.status)}</strong></div>
        <div className="grid"><div className="card"><span className="muted">Portfolio weight</span><div className="kpi" style={{fontSize:20}}>{Number(r.weight).toFixed(1)}%</div></div><div className="card"><span className="muted">Fundamental trend</span><div className="kpi" style={{fontSize:20}}>{r.fundamentals?.status??"—"}</div></div></div>
        {r.positives?.length>0&&<><h3>What looks supportive</h3><ul>{r.positives.map(x=><li key={x}>{x}</li>)}</ul></>}
        {r.concerns?.length>0&&<><h3>What deserves research</h3><ul>{r.concerns.map(x=><li key={x}>{x}</li>)}</ul></>}
        <h3>Other candidates to research</h3><div className="actions">{r.alternatives.map((a:any)=><Link key={a.ticker} className="btn btnSecondary" href={`/research/${a.ticker}?portfolio=${params.id}&category=${encodeURIComponent(r.category)}`}>{a.ticker}</Link>)}</div>
      </div>)}
    </section>
    <section className="panel" style={{marginTop:16}}><div className="actions"><Link className="btn btnSecondary" href={`/portfolios/${params.id}/insights`}>Structure Summary</Link><Link className="btn btnSecondary" href={`/portfolios/${params.id}/alerts`}>Educational Alerts</Link><Link className="btn btnPrimary" href={`/portfolios/${params.id}`}>Back to Portfolio</Link></div></section>
  </>;
}
