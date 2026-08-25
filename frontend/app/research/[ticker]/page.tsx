import { createClient } from "@/lib/supabase/server";
import LiveSecurityScore from "@/components/LiveSecurityScore";
import LiveETFScore from "@/components/LiveETFScore";
import { securityUniverse } from "@/lib/securityUniverse";

const API=process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

async function getResearch(ticker:string){
  try{
    const r=await fetch(`${API}/api/security/${encodeURIComponent(ticker)}`,{cache:"no-store"});
    if(!r.ok)return null;
    return await r.json();
  }catch{return null;}
}

export default async function ResearchPage({params,searchParams}:{params:Promise<{ticker:string}>,searchParams:Promise<{portfolio?:string}>}) {
  const {ticker}=await params;
  const {portfolio:portfolioId}=await searchParams;
  const data=await getResearch(ticker.toUpperCase());
  const supabase=await createClient();
  let investorProfile:any=null;
  if(portfolioId){
    const {data:p}=await supabase.from("portfolios").select("risk_profile").eq("id",portfolioId).single();
    investorProfile=p?.risk_profile??null;
  }
  const profile=Array.isArray(data?.profile)?data.profile[0]:data?.profile;
  const quote=Array.isArray(data?.quote)?data.quote[0]:data?.quote;
  const meta=securityUniverse.find(s=>s.ticker===ticker.toUpperCase());

  return (
    <section className="panel">
      <p className="muted">Company Research</p>
      <h1>{profile?.companyName ?? ticker.toUpperCase()} ({ticker.toUpperCase()})</h1>
      <div className="grid">
        <div className="card"><span className="muted">Current price</span><div className="kpi">{quote?.price ? `$${Number(quote.price).toFixed(2)}` : "—"}</div></div>
        <div className="card"><span className="muted">Sector</span><div className="kpi" style={{fontSize:20}}>{profile?.sector ?? "—"}</div></div>
        <div className="card"><span className="muted">Market cap</span><div className="kpi" style={{fontSize:20}}>{quote?.marketCap ? `$${Number(quote.marketCap).toLocaleString()}` : "—"}</div></div>
      </div>
      <div style={{marginTop:16}}>
        {meta?.type==="ETF"
          ? <LiveETFScore ticker={ticker.toUpperCase()} profile={investorProfile} category={meta?.category} portfolioId={portfolioId}/>
          : <LiveSecurityScore ticker={ticker.toUpperCase()} profile={investorProfile} portfolioId={portfolioId}/>}
      </div>
      <p style={{marginTop:18}}>{profile?.description ?? "Connect the backend and market-data provider to load company research."}</p>
    </section>
  );
}
