import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();

  if(!user){
    return (
      <section className="panel">
        <h1>Portfolio Lab</h1>
        <p className="muted">Sign in to save portfolios across devices.</p>
        <Link className="btn btnPrimary" href="/login">Sign in</Link>
      </section>
    );
  }

  const {data:portfolios}=await supabase
    .from("portfolios")
    .select("id,name,start_date,created_at")
    .order("created_at",{ascending:false});

  return (
    <>
      <section className="panel">
        <p className="muted">Portfolio Lab</p>
        <h1>My Portfolios</h1>
        <p>Signed in as {user.email}</p>
        <div className="actions">
          <Link className="btn btnPrimary" href="/portfolios/new">Create Portfolio</Link>
        </div>
      </section>

      <section style={{marginTop:16}} className="grid">
        {(portfolios ?? []).map(p=>(
          <Link key={p.id} href={`/portfolios/${p.id}`} className="card">
            <strong>{p.name}</strong>
            <p className="muted">Learning portfolio • Started {p.start_date}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
