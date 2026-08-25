import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PerformanceChart from "@/components/PerformanceChart";
import PerformanceSnapshotSaver from "@/components/PerformanceSnapshotSaver";
import { benchmarkLabel, resolveBenchmarkSymbol } from "@/lib/benchmark";

const API=process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

async function calculate(startingCash:number,transactions:any[],benchmark:string){
  if(!transactions.length)return null;
  try{
    const r=await fetch(`${API}/api/analytics/backtest`,{
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({
        starting_cash:startingCash,
        benchmark_symbol:resolveBenchmarkSymbol(benchmark),
        transactions:transactions.map(t=>({
          symbol:t.symbol,
          transaction_type:t.transaction_type,
          trade_date:t.trade_date,
          shares:Number(t.shares),
          price:Number(t.price),
          fees:Number(t.fees||0)
        }))
      }),
      cache:"no-store"
    });
    if(!r.ok)return null;
    return await r.json();
  }catch{return null;}
}

export default async function PerformancePage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const supabase=await createClient();
  const {data:portfolio}=await supabase.from("portfolios").select("*").eq("id",id).single();
  const {data:transactions}=await supabase.from("transactions").select("*").eq("portfolio_id",id).order("trade_date");

  if(!portfolio)return <section className="panel">Portfolio not found.</section>;

  const starting=Number(portfolio.risk_profile?.answers?.amount??0);
  const analytics=await calculate(starting,transactions??[],portfolio.benchmark_symbol);

  return (
    <>
      <section className="panel">
        <p className="muted">Performance</p>
        <h1>{portfolio.name}</h1>
        <p>Performance is reconstructed from your saved simulated transactions and historical market prices.</p>

        <div className="grid">
          <div className="card"><span className="muted">Current portfolio value</span><div className="kpi">{analytics?`$${Number(analytics.current_value).toLocaleString(undefined,{maximumFractionDigits:2})}`:"—"}</div></div>
          <div className="card"><span className="muted">Portfolio return</span><div className="kpi">{analytics?`${Number(analytics.portfolio_return)>=0?"+":""}${Number(analytics.portfolio_return).toFixed(2)}%`:"—"}</div></div>
          <div className="card"><span className="muted">{benchmarkLabel(portfolio.benchmark_symbol)} return</span><div className="kpi">{analytics?`${Number(analytics.benchmark_return)>=0?"+":""}${Number(analytics.benchmark_return).toFixed(2)}%`:"—"}</div></div>
        </div>

        <div className="grid" style={{marginTop:14}}>
          <div className="card"><span className="muted">vs. {benchmarkLabel(portfolio.benchmark_symbol)}</span><div className="kpi">{analytics?`${Number(analytics.excess_return)>=0?"+":""}${Number(analytics.excess_return).toFixed(2)} pts`:"—"}</div></div>
          <div className="card"><span className="muted">Maximum drawdown</span><div className="kpi">{analytics?`${Number(analytics.max_drawdown).toFixed(2)}%`:"—"}</div></div>
          <div className="card"><span className="muted">Annualized volatility</span><div className="kpi">{analytics?`${Number(analytics.annualized_volatility).toFixed(2)}%`:"—"}</div></div>
        </div>
      </section>

      {analytics&&<PerformanceSnapshotSaver portfolioId={id} benchmarkSymbol={resolveBenchmarkSymbol(portfolio.benchmark_symbol)} analytics={analytics}/>}

      <section style={{marginTop:16}}>
        {analytics
          ? <PerformanceChart series={analytics.series}/>
          : <div className="panel">
              <h2>Historical data not available</h2>
              <p className="muted">Record practice transactions and run the FastAPI backend with a valid market-data key to calculate automatic performance.</p>
            </div>}
      </section>

      {analytics && (
        <section className="panel" style={{marginTop:16}}>
          <h2>Backtest Details</h2>
          <p>Period: {analytics.start_date} through {analytics.end_date}</p>
          <p>Historical observations: {analytics.observations}</p>
          <p className="muted">Both lines are normalized to a starting value of $100 so the relative growth rates can be compared directly.</p>
        </section>
      )}

      <section className="panel" style={{marginTop:16}}>
        <div className="actions">
          <Link className="btn btnSecondary" href={`/portfolios/${id}/practice`}>Practice Transactions</Link>
          <Link className="btn btnSecondary" href={`/portfolios/${id}`}>Back to Portfolio</Link>
        </div>
        <p className="muted" style={{marginTop:16}}>Past performance does not predict future results. Historical comparisons depend on transaction accuracy and the historical market data supplied to PortfolioPath.</p>
      </section>
    </>
  );
}
