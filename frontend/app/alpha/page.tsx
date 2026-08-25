import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AlphaPage(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  const {data:portfolios}=user
    ? await supabase.from("portfolios").select("id,name,risk_profile,goal,created_at").order("created_at",{ascending:false})
    : {data:[] as any[]};

  const latest=(portfolios??[])[0];

  return <section className="panel">
    <p className="muted">Alpha Readiness</p>
    <h1>PortfolioPath Alpha</h1>
    <p>This page gives a simple route through the full production workflow.</p>

    <div className="grid">
      <div className="card"><span className="muted">Signed in</span><div className="kpi">{user?"Yes":"No"}</div></div>
      <div className="card"><span className="muted">Portfolios</span><div className="kpi">{(portfolios??[]).length}</div></div>
      <div className="card"><span className="muted">Latest profile</span><div className="kpi" style={{fontSize:20}}>{latest?.risk_profile?.profileName??"—"}</div></div>
    </div>

    <div className="actions">
      {!user
        ? <Link className="btn btnPrimary" href="/login">Sign in</Link>
        : <>
            <Link className="btn btnPrimary" href="/portfolios/new">Create Portfolio</Link>
            <Link className="btn btnSecondary" href="/dashboard">Dashboard</Link>
            {latest&&<Link className="btn btnSecondary" href={`/portfolios/${latest.id}`}>Continue Latest</Link>}
          </>}
    </div>
  </section>;
}
