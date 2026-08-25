export function resolveBenchmarkSymbol(symbol?:string){
  if(!symbol || symbol === "SP500TR") return "SPY";
  return symbol;
}

export function benchmarkLabel(symbol?:string){
  if(!symbol || symbol === "SP500TR") return "S&P 500 proxy (SPY, dividend-adjusted)";
  if(symbol === "SPY") return "S&P 500 proxy (SPY, dividend-adjusted)";
  if(symbol === "^GSPC") return "S&P 500 price index";
  return symbol;
}
