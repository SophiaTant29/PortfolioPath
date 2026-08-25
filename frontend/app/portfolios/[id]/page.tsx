import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import PortfolioProgress from "@/components/PortfolioProgress";
import { benchmarkLabel } from "@/lib/benchmark";

export default async function PortfolioPage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const supabase=await createClient();

  const {data:portfolio}=await supabase
    .from("portfolios")
    .select("*")
    .eq("id",id)
    .single();

  if(!portfolio) return <section className="panel"><h1>Portfolio not found</h1></section>;

  const {data:selections}=await supabase.from("portfolio_selections").select("*").eq("portfolio_id",id);

  const {data:transactions}=await supabase
    .from("transactions")
    .select("*")
    .eq("portfolio_id",id)
    .order("trade_date",{ascending:false});

  return (
    <>
      <section className="panel">
        <p className="muted">{portfolio.mode}</p>
        <h1>{portfolio.name}</h1>
        <p>Benchmark: {benchmarkLabel(portfolio.benchmark_symbol)}</p>
        {portfolio.risk_profile
          ? <p><strong>{portfolio.risk_profile.profileName}</strong> investor profile • Risk {(Number(portfolio.risk_profile.overallRisk)/10).toFixed(1)}/10</p>
          : <p className="muted">Investor profile not completed.</p>}
        <div className="actions">
          <Link className="btn btnSecondary" href={`/portfolios/${id}/questionnaire`}>{portfolio.risk_profile?"Edit Investor Profile":"Start Questionnaire"}</Link>
          {portfolio.risk_profile && <Link className="btn btnSecondary" href={`/portfolios/${id}/recommendation`}>View Recommendation</Link>}
          {portfolio.risk_profile && <Link className="btn btnPrimary" href={`/portfolios/${id}/build?step=0`}>Build Portfolio</Link>}
          {portfolio.risk_profile && <Link className="btn btnSecondary" href={`/portfolios/${id}/practice`}>Practice Mode</Link>}
          {portfolio.risk_profile && <Link className="btn btnSecondary" href={`/portfolios/${id}/performance`}>Performance</Link>}
          {portfolio.risk_profile && <Link className="btn btnSecondary" href={`/portfolios/${id}/review`}>Portfolio Review</Link>}
          {portfolio.risk_profile && <Link className="btn btnSecondary" href={`/portfolios/${id}/insights`}>Insights</Link>}
          {portfolio.risk_profile && <Link className="btn btnSecondary" href={`/portfolios/${id}/alerts`}>Alerts</Link>}
          <Link className="btn btnSecondary" href={`/research/MSFT?portfolio=${id}`}>Research sample stock</Link>
        </div>
      </section>
      <section style={{marginTop:16}}><PortfolioProgress id={id} portfolio={portfolio} selections={selections??[]} transactions={transactions??[]}/></section>
      <section className="panel" style={{marginTop:16}}>
        <h2>Transactions</h2>
        {(transactions??[]).length===0
          ? <p className="muted">No transactions yet.</p>
          : (transactions??[]).map(t=><p key={t.id}>{t.trade_date} • {t.transaction_type} • {t.symbol} • {t.shares} shares @ ${t.price}</p>)}
      </section>
    </>
  );
}
