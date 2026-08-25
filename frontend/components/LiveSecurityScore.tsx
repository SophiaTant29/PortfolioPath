"use client";
import { useEffect,useState } from "react";
import { saveScoreSnapshot } from "@/lib/saveScoreSnapshot";

const API=process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function LiveSecurityScore({ticker,profile,portfolioId}:{ticker:string;profile:any;portfolioId?:string}){
  const [data,setData]=useState<any>(null);
  const [status,setStatus]=useState("Loading live score…");

  useEffect(()=>{(async()=>{
    try{
      const r=await fetch(`${API}/api/security/${encodeURIComponent(ticker)}/score`,{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({investor_profile:{
          profileName:profile?.profileName??"Balanced",
          overallRisk:Number(profile?.overallRisk??55)
        }})
      });
      if(!r.ok)throw new Error();
      const result=await r.json();
      setData(result);
      setStatus("");
      saveScoreSnapshot({
        portfolio_id:portfolioId??null,
        symbol:ticker,
        security_type:"Stock",
        scoring_method:result.scoring_method??"stock-live",
        match_score:Number(result.match_score),
        quality_score:Number(result.quality_score),
        estimated_risk:Number(result.security_risk),
        score_payload:result
      });
    }catch{
      setStatus("Live scoring unavailable. Start the PortfolioPath backend with market-data access.");
    }
  })()},[ticker,profile]);

  if(!data)return <div className="card"><span className="muted">{status}</span></div>;

  const s=data.scores;
  return <div className="card">
    <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
      <div><span className="muted">Portfolio Match</span><div className="kpi">{Number(data.match_score).toFixed(0)}%</div></div>
      <div><span className="muted">Objective Quality</span><div className="kpi">{Number(data.quality_score).toFixed(0)}/100</div></div>
      <div><span className="muted">Estimated Risk</span><div className="kpi">{(Number(data.security_risk)/10).toFixed(1)}/10</div></div>
    </div>
    <div className="grid" style={{marginTop:14}}>
      {[
        ["Financial Strength",s.financial_strength],
        ["Profitability",s.profitability],
        ["Growth",s.growth],
        ["Valuation",s.valuation],
        ["Stability",s.stability],
        ["Dividend",s.dividend]
      ].map(([label,v])=><div className="card" key={String(label)}>
        <span className="muted">{label}</span>
        <div className="kpi" style={{fontSize:20}}>{Number(v).toFixed(0)}/100</div>
      </div>)}
    </div>
    {data.peer_analysis && <div className="card" style={{marginTop:12}}>
      <strong>Peer-relative analysis</strong>
      <p className="muted">
        Compared with {data.peer_analysis.peer_count} available peers. Data coverage: {Number(data.peer_analysis.peer_coverage).toFixed(0)}%.
      </p>
      <div className="grid">
        {[
          ["Revenue Growth",data.peer_analysis.metric_percentiles.revenue_growth],
          ["Profitability",data.peer_analysis.metric_percentiles.net_margin],
          ["Valuation",data.peer_analysis.metric_percentiles.pe],
          ["Balance Sheet",data.peer_analysis.metric_percentiles.debt_to_equity],
          ["Stability",data.peer_analysis.metric_percentiles.annualized_volatility],
        ].map(([label,v])=><div key={String(label)}>
          <span className="muted">{label}</span>
          <p>{v==null?"—":`${Number(v).toFixed(0)}th percentile`}</p>
        </div>)}
      </div>
    </div>}
    <p className="muted" style={{marginTop:12}}>
      Scoring method: {data.scoring_method==="peer-relative-blended"?"Peer-relative + absolute fundamentals":"Absolute fundamentals fallback"}.
      {" "}Match measures fit with this investor profile and portfolio role. It is not a predicted return.
    </p>
  </div>;
}
