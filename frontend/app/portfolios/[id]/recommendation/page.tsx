import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { profileDescriptions } from "@/lib/investorProfile";
import { allocationExplanation } from "@/lib/allocationExplanations";

export default async function RecommendationPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const supabase=await createClient();
  const {data:portfolio}=await supabase.from("portfolios").select("*").eq("id",id).single();
  const rp=portfolio?.risk_profile;
  if(!portfolio)return <section className="panel"><h1>Portfolio not found</h1></section>;
  if(!rp)return <section className="panel"><h1>Investor profile not completed</h1><Link className="btn btnPrimary" href={`/portfolios/${id}/questionnaire`}>Start Questionnaire</Link></section>;

  const allocation=rp.allocation??[];
  const amount=Number(rp.answers?.amount??0);
  return <>
    <section className="panel">
      <p className="sectionEyebrow">Your educational investor profile</p>
      <h1>{rp.profileName}</h1>
      <p>{profileDescriptions[rp.profileName as keyof typeof profileDescriptions]}</p>
      <div className="grid" style={{marginTop:16}}>
        <div className="card"><span className="muted">Overall risk</span><div className="kpi">{(Number(rp.overallRisk)/10).toFixed(1)}/10</div></div>
        <div className="card"><span className="muted">Risk tolerance</span><div className="kpi">{rp.riskTolerance}/100</div></div>
        <div className="card"><span className="muted">Risk capacity</span><div className="kpi">{rp.riskCapacity}/100</div></div>
      </div>
    </section>
    <section className="panel" style={{marginTop:16}}>
      <p className="sectionEyebrow">Educational model allocation</p>
      <h2>{amount>0?`Example using $${amount.toLocaleString()}`:"Percentage model"}</h2>
      <p className="educationalNotice">This allocation is a learning example generated from your questionnaire. It is not a recommendation to buy, sell, or hold any investment.</p>
      <div style={{display:"grid",gap:10}}>{allocation.map((a:any)=>{const why=allocationExplanation(a.name,Number(a.pct),rp);return <div key={a.name} className="card">
        <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><strong>{a.name}</strong><span><strong>{Number(a.pct).toFixed(1)}%</strong>{amount>0?` • $${Number(a.dollars).toLocaleString(undefined,{maximumFractionDigits:0})}`:""}</span></div>
        <p className="helpText"><strong>Why am I seeing this?</strong> {why.headline}</p>
        <ul>{why.reasons.slice(0,2).map((r:string)=><li key={r}>{r}</li>)}</ul>
      </div>})}</div>
      <div className="actions"><Link className="btn btnSecondary" href={`/portfolios/${id}/questionnaire`}>Edit Answers</Link><Link className="btn btnPrimary" href={`/portfolios/${id}/build?step=0`}>Start Building</Link></div>
    </section>
    <section className="panel" style={{marginTop:16}}><h2>How PortfolioPath reached this result</h2><p className="muted">Risk tolerance reflects comfort with losses. Risk capacity reflects how much risk your time horizon and financial flexibility may support. PortfolioPath gives greater weight to the lower of the two so willingness to take risk cannot fully override limited capacity.</p></section>
  </>;
}
