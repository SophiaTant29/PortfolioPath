import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProfilePreferences from "@/components/ProfilePreferences";
import DeleteAccountButton from "@/components/DeleteAccountButton";

export default async function ProfilePage(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  const {data:portfolios}=user
    ? await supabase.from("portfolios").select("id,name,risk_profile,created_at").order("created_at",{ascending:false})
    : {data:[] as any[]};
  const latest=(portfolios??[])[0];
  const horizon=latest?.risk_profile?.answers?.horizon;
  const horizonLabel:Record<string,string>={lt2:"Less than 2 years","2to5":"2–5 years","5to10":"5–10 years",gt10:"More than 10 years",none:"No specific time frame"};

  return <>
    <section className="panel">
      <p className="sectionEyebrow">Profile</p>
      <h1>Your PortfolioPath profile</h1>
      <p>Manage your learning preferences and see the investor profile connected to your most recent learning portfolio.</p>
      <div className="grid">
        <div className="card"><span className="muted">Account</span><div className="kpi" style={{fontSize:18}}>{user?.email??"Not signed in"}</div></div>
        <div className="card"><span className="muted">Saved portfolios</span><div className="kpi">{(portfolios??[]).length}</div></div>
        <div className="card"><span className="muted">Latest risk profile</span><div className="kpi" style={{fontSize:20}}>{latest?.risk_profile?.profileName??"—"}</div></div>
        <div className="card"><span className="muted">Time horizon</span><div className="kpi" style={{fontSize:18}}>{horizonLabel[String(horizon)]??"—"}</div></div>
      </div>
    </section>
    <section className="panel" style={{marginTop:16}}><ProfilePreferences/></section>
    <section className="panel" style={{marginTop:16}}>
      <h2>Your learning portfolios</h2>
      {(portfolios??[]).length===0?<p className="muted">No learning portfolios yet.</p>:(portfolios??[]).slice(0,6).map((p:any)=><div className="card" key={p.id} style={{marginBottom:10}}><strong>{p.name}</strong><p className="muted">{p.risk_profile?.profileName??"Questionnaire not completed"}</p><Link className="btn btnSecondary" href={`/portfolios/${p.id}`}>Open</Link></div>)}
      <div className="actions">
        <Link className="btn btnPrimary" href="/portfolios/new">Create Learning Portfolio</Link>
        {latest&&<Link className="btn btnSecondary" href={`/portfolios/${latest.id}/questionnaire`}>Retake / Edit Questionnaire</Link>}
        <Link className="btn btnSecondary" href="/logout">Sign Out</Link>
      </div>
      <div style={{marginTop:18,paddingTop:16,borderTop:"1px solid var(--line)"}}><h3>Account controls</h3><DeleteAccountButton/></div>
    </section>
  </>;
}
