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


  return (
    <>
      <section className="panel">
        <p className="muted">Learning Portfolio</p>
        <h1>{portfolio.name}</h1>
        <p>Benchmark: {benchmarkLabel(portfolio.benchmark_symbol)}</p>
        {portfolio.risk_profile
          ? <p><strong>{portfolio.risk_profile.profileName}</strong> investor profile • Risk {(Number(portfolio.risk_profile.overallRisk)/10).toFixed(1)}/10</p>
          : <p className="muted">Investor profile not completed.</p>}
        <div className="actions">
          <Link className="btn btnSecondary" href={`/portfolios/${id}/questionnaire`}>{portfolio.risk_profile?"Edit Investor Profile":"Start Questionnaire"}</Link>
          {portfolio.risk_profile && <Link className="btn btnSecondary" href={`/portfolios/${id}/recommendation`}>View Model Allocation</Link>}
          {portfolio.risk_profile && <Link className="btn btnPrimary" href={`/portfolios/${id}/build?step=0`}>Build Portfolio</Link>}
          {portfolio.risk_profile && <Link className="btn btnSecondary" href={`/portfolios/${id}/review`}>Portfolio Review</Link>}
          {portfolio.risk_profile && <Link className="btn btnSecondary" href={`/portfolios/${id}/insights`}>Structure Summary</Link>}
          {portfolio.risk_profile && <Link className="btn btnSecondary" href={`/portfolios/${id}/alerts`}>Educational Alerts</Link>}
          <Link className="btn btnSecondary" href={`/research/MSFT?portfolio=${id}`}>Explore Sample Research</Link>
        </div>
      </section>
      <section style={{marginTop:16}}><PortfolioProgress id={id} portfolio={portfolio} selections={selections??[]}/></section>
    </>
  );
}
