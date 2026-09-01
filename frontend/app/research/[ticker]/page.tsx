import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { securityUniverse } from "@/lib/securityUniverse";
import { guidanceFor, researchResources } from "@/lib/researchGuidance";

const API=process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

async function getResearch(ticker:string){
  try{
    const r=await fetch(`${API}/api/security/${encodeURIComponent(ticker)}`,{next:{revalidate:2592000}});
    if(!r.ok)return null;
    return await r.json();
  }catch{return null;}
}

export default async function ResearchPage({
  params,searchParams
}:{
  params:Promise<{ticker:string}>,
  searchParams:Promise<{portfolio?:string;category?:string}>
}) {
  const {ticker}=await params;
  const {portfolio:portfolioId,category}=await searchParams;
  const symbol=ticker.toUpperCase();
  const data=await getResearch(symbol);
  const supabase=await createClient();
  let investorProfile:any=null;
  if(portfolioId){
    const {data:p}=await supabase.from("portfolios").select("risk_profile").eq("id",portfolioId).single();
    investorProfile=p?.risk_profile??null;
  }
  const profile=Array.isArray(data?.profile)?data.profile[0]:data?.profile;
  const meta=securityUniverse.find(s=>s.ticker===symbol);
  const securityType=(meta?.type==="ETF"?"ETF":"Stock") as "ETF"|"Stock";
  const categoryName=category ?? meta?.category ?? "";
  const categoryInfo=guidanceFor(categoryName);
  const resources=researchResources(securityType);

  const officialUrl=profile?.website || null;
  const yahoo=`https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/`;
  const sec=`https://www.sec.gov/edgar/search/`;

  return (
    <>
      <section className="panel">
        <p className="muted">Guided Research • {categoryName || "Portfolio candidate"}</p>
        <h1>{profile?.companyName ?? meta?.name ?? symbol} ({symbol})</h1>
        <p><strong>Why you are researching it:</strong> This investment appears in your {categoryName || "current"} research library. PortfolioPath is helping you investigate it before you decide whether it belongs in the portfolio.</p>
        {portfolioId && <Link className="btn btnSecondary" href={`/portfolios/${portfolioId}/build`}>Back to Builder</Link>}
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>First: understand the role</h2>
        <p>{categoryInfo.role}</p>
        <h3>Questions to keep in mind</h3>
        <ul>{categoryInfo.questions.map(q=><li key={q}>{q}</li>)}</ul>
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>Quick facts</h2>
        <div className="grid">
          <div className="card"><span className="muted">Type</span><div className="kpi" style={{fontSize:20}}>{securityType}</div></div>
          <div className="card"><span className="muted">Sector / category</span><div className="kpi" style={{fontSize:20}}>{profile?.sector ?? categoryName ?? "—"}</div></div>
          <div className="card"><span className="muted">Industry</span><div className="kpi" style={{fontSize:20}}>{profile?.industry ?? "—"}</div></div>
        </div>
        <p className="helpText" style={{marginTop:16}}>PortfolioPath uses monthly research snapshots. The displayed information may be up to 30 days old and is intentionally not a live-price feed.</p>
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>Research resources</h2>
        <p className="muted">Every resource has a purpose. Use the “what to look for” list so you know what information matters instead of simply opening links.</p>

        {resources.map((r,i)=>{
          const isOfficial=i===0;
          const isSec=r.title.includes("SEC");
          const isPrice=r.title.includes("Price");
          let href:string|null=null;
          if(isOfficial)href=officialUrl;
          if(isSec)href=sec;
          if(isPrice)href=yahoo;
          return <div className="card" key={r.title} style={{marginTop:12}}>
            <h3>{r.title}</h3>
            <p><strong>Why it is here:</strong> {r.why}</p>
            <p><strong>What to look for:</strong></p>
            <ul>{r.lookFor.map(x=><li key={x}>{x}</li>)}</ul>
            {href
              ? <a className="btn btnSecondary" href={href} target="_blank" rel="noreferrer">Open resource ↗</a>
              : <p className="muted">This source is best reviewed directly using the external research links above.</p>}
          </div>
        })}
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>Your research checkpoint</h2>
        <p>Before selecting this investment, you should be able to explain:</p>
        <ol>
          <li>What role it plays in the portfolio.</li>
          <li>The two or three risks that matter most.</li>
          <li>The main strengths and risks you found in your research.</li>
          <li>Why you are choosing it for its characteristics rather than its recent price performance.</li>
        </ol>
        {portfolioId && <div className="actions"><Link className="btn btnPrimary" href={`/portfolios/${portfolioId}/build`}>Return to portfolio options</Link></div>}
      </section>

      {profile?.description && <section className="panel" style={{marginTop:16}}>
        <h2>Business / fund description</h2>
        <p>{profile.description}</p>
      </section>}
    </>
  );
}
