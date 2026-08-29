type Sec = {
  ticker:string;
  name:string;
  type:string;
  risk:number;
  quality:number;
  growth:number;
  stability:number;
  dividend:number;
};

export function comparisonTakeaways(items: Sec[]) {
  if (items.length < 2) return [];
  const out:string[] = [];

  const maxBy=(key:keyof Sec)=>[...items].sort((a:any,b:any)=>Number(b[key])-Number(a[key]))[0];
  const minBy=(key:keyof Sec)=>[...items].sort((a:any,b:any)=>Number(a[key])-Number(b[key]))[0];

  const highQuality=maxBy("quality");
  const highGrowth=maxBy("growth");
  const highStability=maxBy("stability");
  const lowRisk=minBy("risk");
  const highDividend=maxBy("dividend");

  out.push(`${highQuality.ticker} has the strongest quality score in this comparison.`);
  out.push(`${highGrowth.ticker} has the strongest growth score, which may come with different valuation or volatility tradeoffs.`);
  out.push(`${highStability.ticker} scores highest for stability.`);
  out.push(`${lowRisk.ticker} has the lowest modeled risk score among these choices.`);
  if (Number(highDividend.dividend) > 45) out.push(`${highDividend.ticker} has the strongest dividend characteristic in this group.`);
  if (items.some(i=>i.type==="ETF") && items.some(i=>i.type==="Stock")) {
    out.push("You are comparing both funds and individual companies. Funds may provide broader diversification, while individual stocks usually create more company-specific risk.");
  }

  return [...new Set(out)];
}

export function whatMattersForComparison(typeSet:string[]) {
  const hasETF=typeSet.includes("ETF");
  const hasStock=typeSet.includes("Stock");
  if (hasETF && !hasStock) {
    return [
      "How broad is each fund's diversification?",
      "Do the funds own many of the same holdings?",
      "Are there meaningful differences in cost, concentration, and index methodology?",
      "Would owning more than one create unnecessary overlap?"
    ];
  }
  if (hasStock && !hasETF) {
    return [
      "Which company has stronger financial quality and free cash flow?",
      "Which has better growth relative to its valuation?",
      "How much company-specific risk would each position add?",
      "Are you choosing based on fundamentals or recent price performance?"
    ];
  }
  return [
    "Are you comparing investments that actually serve the same portfolio role?",
    "How much diversification does each choice provide?",
    "How do risk and growth characteristics differ?",
    "Would one choice make the portfolio unnecessarily concentrated?"
  ];
}
