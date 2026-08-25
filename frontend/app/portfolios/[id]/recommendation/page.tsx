import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { profileDescriptions } from "@/lib/investorProfile";

export default async function RecommendationPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const supabase=await createClient();
  const {data:portfolio}=await supabase.from("portfolios").select("*").eq("id",id).single();

  const rp=portfolio?.risk_profile;
  if(!portfolio) return <section className="panel"><h1>Portfolio not found</h1></section>;
  if(!rp) return (
    <section className="panel">
      <h1>Investor profile not completed</h1>
      <Link className="btn btnPrimary" href={`/portfolios/${id}/questionnaire`}>Start Questionnaire</Link>
    </section>
  );

  const allocation=rp.allocation ?? [];
  const amount=Number(rp.answers?.amount ?? 0);
  const debtNotice=rp.debtNotice;

  return (
    <>
      <section className="panel">
        <p className="muted">Recommended Investor Profile</p>
        <h1>{rp.profileName}</h1>
        <p>{profileDescriptions[rp.profileName as keyof typeof profileDescriptions]}</p>

        <div className="grid" style={{marginTop:16}}>
          <div className="card"><span className="muted">Overall risk</span><div className="kpi">{(Number(rp.overallRisk)/10).toFixed(1)}/10</div></div>
          <div className="card"><span className="muted">Risk tolerance</span><div className="kpi">{rp.riskTolerance}/100</div></div>
          <div className="card"><span className="muted">Risk capacity</span><div className="kpi">{rp.riskCapacity}/100</div></div>
        </div>
      </section>

      {debtNotice==="strong" && (
        <section className="panel" style={{marginTop:16,borderColor:"#e6b55b"}}>
          <strong>Important financial consideration</strong>
          <p>Because you indicated significant high-interest debt, consider whether paying down some of that debt should come before investing the full amount.</p>
        </section>
      )}

      <section className="panel" style={{marginTop:16}}>
        <p className="muted">Recommended Allocation</p>
        <h2>${amount.toLocaleString()} Portfolio</h2>
        <div style={{display:"grid",gap:10}}>
          {allocation.map((a:any)=>(
            <div key={a.name} className="card" style={{display:"grid",gridTemplateColumns:"1.4fr .7fr .8fr",gap:12,alignItems:"center"}}>
              <strong>{a.name}</strong>
              <span>{Number(a.pct).toFixed(1)}%</span>
              <span>${Number(a.dollars).toLocaleString(undefined,{maximumFractionDigits:0})}</span>
            </div>
          ))}
        </div>
        <div className="actions">
          <Link className="btn btnSecondary" href={`/portfolios/${id}/questionnaire`}>Edit Answers</Link>
          <Link className="btn btnPrimary" href={`/portfolios/${id}/build?step=0`}>Start Building Portfolio</Link>
        </div>
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>How PortfolioPath reached this result</h2>
        <p className="muted">
          Risk tolerance reflects how comfortable you are with market losses. Risk capacity reflects how much risk your time horizon and financial flexibility may reasonably support. PortfolioPath gives greater weight to the lower of the two so a high willingness to take risk cannot fully override limited financial capacity.
        </p>
      </section>
    </>
  );
}
