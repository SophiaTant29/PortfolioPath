import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  const {data:portfolios}=user
    ? await supabase.from("portfolios").select("id,name,risk_profile,created_at").order("created_at",{ascending:false})
    : {data:[] as any[]};
  const latest=(portfolios??[])[0];

  return <>
    <section className="panel">
      <p className="muted">Profile</p>
      <h1>Your PortfolioPath profile</h1>
      <p>Use this page to see your account, saved learning portfolios, and most recent investor profile.</p>
      <div className="grid">
        <div className="card"><span className="muted">Account</span><div className="kpi" style={{fontSize:18}}>{user?.email??"Not signed in"}</div></div>
        <div className="card"><span className="muted">Saved portfolios</span><div className="kpi">{(portfolios??[]).length}</div></div>
        <div className="card"><span className="muted">Latest investor profile</span><div className="kpi" style={{fontSize:20}}>{latest?.risk_profile?.profileName??"—"}</div></div>
      </div>
      <div className="actions">
        {!user ? <Link className="btn btnPrimary" href="/login">Sign in</Link> : <>
          <Link className="btn btnPrimary" href="/portfolios/new">Create Portfolio</Link>
          <Link className="btn btnSecondary" href="/dashboard">Dashboard</Link>
          {latest&&<Link className="btn btnSecondary" href={`/portfolios/${latest.id}`}>Continue Latest</Link>}
        </>}
      </div>
    </section>
    <section className="panel" style={{marginTop:16}}>
      <h2>What this site is for</h2>
      <p>PortfolioPath is an educational tool for learning asset allocation, diversification, security research, and portfolio construction. Portfolios created here are learning exercises, not brokerage accounts.</p>
    </section>
  </>;
}
