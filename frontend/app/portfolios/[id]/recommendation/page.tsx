import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { profileDescriptions } from "@/lib/investorProfile";
import { allocationExplanation } from "@/lib/allocationExplanations";
import { simplifyAllocationForAmount, complexityExplanation, portfolioComplexityPlan } from "@/lib/portfolioComplexity";

export default async function RecommendationPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const supabase=await createClient();
  const {data:portfolio}=await supabase.from("portfolios").select("*").eq("id",id).single();
  const rp=portfolio?.risk_profile;
  if(!portfolio)return <section className="panel"><h1>Portfolio not found</h1></section>;
  if(!rp)return <section className="panel"><h1>Investor profile not completed</h1><Link className="btn btnPrimary" href={`/portfolios/${id}/questionnaire`}>Start Questionnaire</Link></section>;

  const fullAllocation=rp.allocation??[];
  const amount=Number(rp.answers?.amount??0);
  const allocation=simplifyAllocationForAmount(fullAllocation,amount,rp.answers?.approach);
  const complexity=portfolioComplexityPlan(amount,rp.answers?.approach);
  return <>
    <div className="pageHeader" style={{marginBottom:24}}>
      <div><p className="sectionEyebrow">Illustrative learning model</p><h1>Model allocation.</h1><p className="muted">A simplified allocation exercise generated from your questionnaire responses for educational use.</p></div>
      <div className="actions"><Link className="btn btnSecondary" href={`/portfolios/${id}/questionnaire`}>Edit Questionnaire</Link><Link className="btn btnPrimary" href={`/portfolios/${id}/build?step=0`}>Explore the Model</Link></div>
    </div>
    <p className="educationalNotice">This allocation is a learning example. It does not assess your complete financial circumstances, determine suitability, or recommend any allocation or security for real-world use.</p>
    <section className="metricStrip">
      <div className="metricItem"><small>Learning profile</small><strong>{rp.profileName}</strong></div>
      <div className="metricItem"><small>Overall risk</small><strong>{(Number(rp.overallRisk)/10).toFixed(1)}/10</strong></div>
      <div className="metricItem"><small>Portfolio complexity</small><strong>{complexity.label}</strong></div>
    </section>
    <section className="panel" style={{padding:0,overflow:"hidden"}}>
      <div style={{padding:"22px 24px 8px"}}><p className="sectionEyebrow">Allocation breakdown</p><h2>{amount>0?`Example using $${amount.toLocaleString()}`:"Percentage model"}</h2><p className="muted">{complexityExplanation(amount,fullAllocation,allocation)}</p></div>
      <div className="allocationTable" style={{border:0,borderRadius:0}}>
        <div className="allocationRow allocationHead"><div>Category</div><div>Weight</div><div>{amount>0?"Example amount":"Context"}</div></div>
        {allocation.map((a:any)=>{const why=allocationExplanation(a.name,Number(a.pct),rp);return <div key={a.name} className="allocationRow">
          <div><strong>{a.name}</strong><div className="allocationBar"><span style={{width:`${Math.min(100,Number(a.pct))}%`}} /></div><div className="helpText">{why.headline}</div></div>
          <div><strong>{Number(a.pct).toFixed(1)}%</strong></div>
          <div>{amount>0?<strong>${Number(a.dollars).toLocaleString(undefined,{maximumFractionDigits:0})}</strong>:<span className="muted">Learning model</span>}</div>
        </div>})}
      </div>
    </section>
    <section className="panel"><p className="sectionEyebrow">How it works</p><h2>Understanding the profile</h2><p className="muted">{profileDescriptions[rp.profileName as keyof typeof profileDescriptions]}</p><p className="muted">Risk tolerance reflects comfort with losses. Risk capacity reflects how much risk your time horizon and financial flexibility may support. PortfolioPath gives greater weight to the lower of the two so willingness to take risk cannot fully override limited capacity.</p></section>
  </>;
}
