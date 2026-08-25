"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { securityUniverse } from "@/lib/securityUniverse";

type Allocation={name:string;pct:number;dollars:number};
type Selection={ticker:string;name:string;category:string;amount:number;type:string};

function fitScore(s:any,rp:any){
  const profile=rp?.profileName ?? "Balanced";
  const weights:any={
    "Protect":{quality:.30,stability:.30,growth:.05,dividend:.15,risk:.20},
    "Cautious":{quality:.28,stability:.25,growth:.08,dividend:.14,risk:.25},
    "Balanced":{quality:.25,stability:.18,growth:.20,dividend:.08,risk:.29},
    "Growth":{quality:.22,stability:.10,growth:.32,dividend:.04,risk:.32},
    "Aggressive Growth":{quality:.18,stability:.06,growth:.38,dividend:.03,risk:.35},
  }[profile];
  const targetRisk=Number(rp?.overallRisk ?? 55);
  const riskFit=Math.max(0,100-Math.abs(Number(s.risk)-targetRisk)*1.6);
  const score=s.quality*weights.quality+s.stability*weights.stability+s.growth*weights.growth+s.dividend*weights.dividend+riskFit*weights.risk;
  const approach=rp?.answers?.approach;
  let adj=0;
  if(approach==="funds"&&s.type==="ETF")adj+=6;
  if(approach==="stocks"&&s.type==="Stock")adj+=5;
  return Math.max(1,Math.min(99,Math.round(score+adj)));
}

export default function PortfolioBuilder(){
  const params=useParams<{id:string}>();
  const router=useRouter();
  const search=useSearchParams();
  const [portfolio,setPortfolio]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [searchText,setSearchText]=useState("");
  const [typeFilter,setTypeFilter]=useState<"All"|"Stock"|"ETF">("All");
  const [selections,setSelections]=useState<Record<string,Selection>>({});
  const [message,setMessage]=useState("");
  const [liveScores,setLiveScores]=useState<Record<string,number>>({});

  useEffect(()=>{(async()=>{
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){router.push("/login");return}
    const {data:p}=await supabase.from("portfolios").select("*").eq("id",params.id).eq("user_id",user.id).single();
    setPortfolio(p);
    const {data:existing}=await supabase.from("portfolio_selections").select("*").eq("portfolio_id",params.id).eq("user_id",user.id);
    const map:Record<string,Selection>={};
    (existing??[]).forEach((x:any)=>map[x.symbol]={ticker:x.symbol,name:x.name,category:x.category,amount:Number(x.planned_amount),type:x.security_type});
    setSelections(map);
    setLoading(false);
  })()},[params.id,router]);

  const allocation:Allocation[]=portfolio?.risk_profile?.allocation ?? [];
  const idx=Math.max(0,Math.min(allocation.length-1,Number(search.get("step")??0)));
  const current=allocation[idx];

  const options=useMemo(()=>{
    if(!current)return [];
    return securityUniverse
      .filter(s=>s.category===current.name)
      .filter(s=>typeFilter==="All"||s.type===typeFilter)
      .filter(s=>`${s.ticker} ${s.name}`.toLowerCase().includes(searchText.toLowerCase()))
      .map(s=>({...s,match:fitScore(s,portfolio?.risk_profile)}))
      .sort((a,b)=>b.match-a.match);
  },[current,typeFilter,searchText,portfolio]);

  if(loading)return <section className="panel">Loading portfolio builder…</section>;
  if(!portfolio)return <section className="panel">Portfolio not found.</section>;
  if(!current)return <section className="panel"><h1>No allocation found</h1><Link className="btn btnPrimary" href={`/portfolios/${params.id}/questionnaire`}>Complete Questionnaire</Link></section>;

  const categorySelected=Object.values(selections).filter(s=>s.category===current.name).reduce((sum,s)=>sum+s.amount,0);
  const remaining=current.dollars-categorySelected;

  async function saveAmount(s:any,amount:number){
    const clean=Math.max(0,Number(amount)||0);
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return;

    if(clean===0){
      await supabase.from("portfolio_selections").delete().eq("portfolio_id",params.id).eq("user_id",user.id).eq("symbol",s.ticker);
      setSelections(prev=>{const n={...prev};delete n[s.ticker];return n});
      return;
    }
    const row={
      portfolio_id:params.id,user_id:user.id,symbol:s.ticker,name:s.name,category:s.category,
      security_type:s.type,planned_amount:clean
    };
    const {error}=await supabase.from("portfolio_selections").upsert(row,{onConflict:"portfolio_id,symbol"});
    if(error){setMessage(error.message);return}
    setSelections(prev=>({...prev,[s.ticker]:{ticker:s.ticker,name:s.name,category:s.category,amount:clean,type:s.type}}));
  }

  function goStep(next:number){
    router.push(`/portfolios/${params.id}/build?step=${next}`);
  }

  async function loadLiveScore(ticker:string,type:"Stock"|"ETF",category:string){
    if(liveScores[ticker]!=null)return;
    try{
      const base=process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const endpoint=type==="ETF"?`${base}/api/etf/${encodeURIComponent(ticker)}/score`:`${base}/api/security/${encodeURIComponent(ticker)}/score`;
      const body=type==="ETF"
        ? {investor_profile:{profileName:portfolio?.risk_profile?.profileName??"Balanced",overallRisk:Number(portfolio?.risk_profile?.overallRisk??55)},portfolio_category:category}
        : {investor_profile:{profileName:portfolio?.risk_profile?.profileName??"Balanced",overallRisk:Number(portfolio?.risk_profile?.overallRisk??55)}};
      const r=await fetch(endpoint,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
      if(!r.ok)throw new Error();
      const j=await r.json();
      setLiveScores(prev=>({...prev,[ticker]:Number(j.match_score)}));
    }catch{
      setLiveScores(prev=>({...prev,[ticker]:-1}));
    }
  }

  const totalSelected=Object.values(selections).reduce((s,x)=>s+x.amount,0);
  const target=Number(portfolio.risk_profile?.answers?.amount??0);

  return (
    <>
      <section className="panel">
        <p className="muted">Guided Portfolio Builder</p>
        <h1>{current.name}</h1>
        <p>
          Target allocation: <strong>${Number(current.dollars).toLocaleString(undefined,{maximumFractionDigits:0})}</strong>
          {" "}({Number(current.pct).toFixed(1)}% of your portfolio).
        </p>
        <div className="grid">
          <div className="card"><span className="muted">Category step</span><div className="kpi">{idx+1}/{allocation.length}</div></div>
          <div className="card"><span className="muted">Selected here</span><div className="kpi">${categorySelected.toLocaleString(undefined,{maximumFractionDigits:0})}</div></div>
          <div className="card"><span className="muted">Remaining here</span><div className="kpi">${Math.max(0,remaining).toLocaleString(undefined,{maximumFractionDigits:0})}</div></div>
        </div>
      </section>

      <section className="panel" style={{marginTop:16}}>
        <div className="grid">
          <label className="field">Search
            <input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Company or ticker"/>
          </label>
          <label className="field">Investment type
            <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value as any)}>
              <option>All</option><option>Stock</option><option>ETF</option>
            </select>
          </label>
          <div className="field"><span className="muted">Options available</span><div className="kpi">{options.length}</div></div>
        </div>
      </section>

      <section style={{marginTop:16,display:"grid",gap:12}}>
        {options.map((s:any)=>{
          const selected=selections[s.ticker]?.amount??0;
          return <div className="card cardInteractive" key={s.ticker}>
            <div style={{display:"flex",justifyContent:"space-between",gap:14,alignItems:"flex-start",flexWrap:"wrap"}}>
              <div>
                <strong style={{fontSize:18}}>{s.ticker} — {s.name}</strong>
                <p className="muted">{s.type} • {s.category}</p><p className="helpText">Match reflects fit with your profile and portfolio role, not expected return.</p>
              </div>
              <div>
                <strong>{liveScores[s.ticker]!=null && liveScores[s.ticker]>=0 ? `${liveScores[s.ticker].toFixed(0)}% Match` : "Live score available"}</strong>
                <div className="muted" style={{fontSize:12}}>{liveScores[s.ticker]===-1?"Backend unavailable":"Calculated from real fundamentals and market data"}</div>
                {liveScores[s.ticker]==null && <button className="btn btnSecondary" style={{marginTop:8}} onClick={()=>loadLiveScore(s.ticker,s.type,s.category)}>Calculate Match</button>}
              </div>
            </div>
            <div className="grid">
              <div className="card"><span className="muted">Risk</span><div className="kpi" style={{fontSize:20}}>{Math.round(s.risk/10)}/10</div></div>
              <div className="card"><span className="muted">Growth</span><div className="kpi" style={{fontSize:20}}>{s.growth}/100</div></div>
              <div className="card"><span className="muted">Stability</span><div className="kpi" style={{fontSize:20}}>{s.stability}/100</div></div>
            </div>
            <div className="actions">
              <Link className="btn btnSecondary" href={`/research/${s.ticker}?portfolio=${params.id}`}>Research</Link>
              <label className="field" style={{margin:0,minWidth:180}}>Planned amount
                <input type="number" min="0" step="50" value={selected}
                  onChange={e=>saveAmount(s,Number(e.target.value))}/>
              </label>
            </div>
          </div>
        })}
      </section>

      <section className="panel" style={{marginTop:16}}>
        <p><strong>Total portfolio selected:</strong> ${totalSelected.toLocaleString(undefined,{maximumFractionDigits:0})} of ${target.toLocaleString(undefined,{maximumFractionDigits:0})}</p>
        {categorySelected>current.dollars*1.1 && <p style={{color:"#b33a3a"}}>This category is more than 10% above its recommended allocation.</p>}
        <div className="actions">
          {idx>0 && <button className="btn btnSecondary" onClick={()=>goStep(idx-1)}>Previous Category</button>}
          {idx<allocation.length-1
            ? <button className="btn btnPrimary" onClick={()=>goStep(idx+1)}>Next Category</button>
            : <Link className="btn btnPrimary" href={`/portfolios/${params.id}/summary`}>Finish Portfolio</Link>}
        </div>
        {message&&<p>{message}</p>}
      </section>
    </>
  );
}
