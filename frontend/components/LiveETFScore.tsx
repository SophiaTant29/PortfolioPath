"use client";
import { useEffect,useState } from "react";
import { saveScoreSnapshot } from "@/lib/saveScoreSnapshot";

const API=process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function LiveETFScore({ticker,profile,category,portfolioId}:{ticker:string;profile:any;category?:string;portfolioId?:string}){
  const [data,setData]=useState<any>(null);
  const [status,setStatus]=useState("Loading ETF analysis…");

  useEffect(()=>{(async()=>{
    try{
      const r=await fetch(`${API}/api/etf/${encodeURIComponent(ticker)}/score`,{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({
          investor_profile:{
            profileName:profile?.profileName??"Balanced",
            overallRisk:Number(profile?.overallRisk??55)
          },
          portfolio_category:category??null
        })
      });
      if(!r.ok)throw new Error();
      const result=await r.json();
      setData(result);setStatus("");
      saveScoreSnapshot({
        portfolio_id:portfolioId??null,
        symbol:ticker,
        security_type:"ETF",
        scoring_method:"etf-live",
        match_score:Number(result.match_score),
        quality_score:Number(result.quality_score),
        estimated_risk:Number(result.estimated_risk),
        score_payload:result
      });
    }catch{setStatus("ETF scoring unavailable. Start the PortfolioPath backend with market-data access.");}
  })()},[ticker,profile,category]);

  if(!data)return <div className="card"><span className="muted">{status}</span></div>;

  const s=data.scores,m=data.metrics;
  return <div className="card">
    <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
      <div><span className="muted">Portfolio Match</span><div className="kpi">{Number(data.match_score).toFixed(0)}%</div></div>
      <div><span className="muted">ETF Quality</span><div className="kpi">{Number(data.quality_score).toFixed(0)}/100</div></div>
      <div><span className="muted">Estimated Risk</span><div className="kpi">{(Number(data.estimated_risk)/10).toFixed(1)}/10</div></div>
    </div>
    <div className="grid" style={{marginTop:14}}>
      {[
        ["Diversification",s.diversification],
        ["Low Cost",s.expense_ratio],
        ["Liquidity",s.liquidity],
        ["Concentration",s.concentration],
        ["Stability",s.stability],
        ["Fund Size",s.fund_size],
      ].map(([label,v])=><div className="card" key={String(label)}>
        <span className="muted">{label}</span><div className="kpi" style={{fontSize:20}}>{Number(v).toFixed(0)}/100</div>
      </div>)}
    </div>
    <div className="grid" style={{marginTop:14}}>
      <div><span className="muted">Expense ratio</span><p>{m.expense_ratio==null?"—":`${(Number(m.expense_ratio)*100).toFixed(2)}%`}</p></div>
      <div><span className="muted">Holdings analyzed</span><p>{m.holding_count??"—"}</p></div>
      <div><span className="muted">Top-10 concentration</span><p>{m.top10_weight==null?"—":`${(Number(m.top10_weight)*100).toFixed(1)}%`}</p></div>
    </div>
    <p className="muted">ETF Match measures diversification, cost, liquidity, concentration, stability, and fit. It does not predict future returns.</p>
  </div>;
}
