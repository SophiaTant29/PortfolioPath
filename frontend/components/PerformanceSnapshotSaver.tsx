"use client";
import { useEffect } from "react";

export default function PerformanceSnapshotSaver({portfolioId,benchmarkSymbol,analytics}:{portfolioId:string;benchmarkSymbol:string;analytics:any}){
  useEffect(()=>{
    if(!analytics?.end_date)return;
    fetch("/api/performance-snapshot",{
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({
        portfolio_id:portfolioId,
        snapshot_date:analytics.end_date,
        benchmark_symbol:benchmarkSymbol,
        portfolio_value:analytics.current_value,
        portfolio_return:analytics.portfolio_return,
        benchmark_return:analytics.benchmark_return,
        excess_return:analytics.excess_return,
        max_drawdown:analytics.max_drawdown,
        annualized_volatility:analytics.annualized_volatility,
        start_date:analytics.start_date,
        end_date:analytics.end_date,
        observations:analytics.observations,
      })
    }).catch(()=>{});
  },[portfolioId,benchmarkSymbol,analytics]);
  return null;
}
