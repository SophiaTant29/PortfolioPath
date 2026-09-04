import { backendFetch } from "@/lib/backend";

async function getHealth(){
  try{
    const r=await backendFetch(`/health`,{cache:"no-store"});
    if(!r.ok)return null;
    return await r.json();
  }catch{return null;}
}

export default async function SystemStatusPage(){
  const health=await getHealth();
  return <section className="panel">
    <p className="muted">System Status</p>
    <h1>PortfolioPath Services</h1>
    <div className="grid">
      <div className="card"><span className="muted">Frontend</span><div className="kpi" aria-label="Frontend online">Online</div></div>
      <div className="card"><span className="muted">Analytics API</span><div className="kpi">{health?"Online":"Offline"}</div></div>
      <div className="card"><span className="muted">Market data</span><div className="kpi" style={{fontSize:20}}>{health?.market_data_configured?"Configured":"Not configured"}</div></div>
    </div>
    {health&&<p className="muted">Backend version: {health.version}</p>}
  </section>;
}
