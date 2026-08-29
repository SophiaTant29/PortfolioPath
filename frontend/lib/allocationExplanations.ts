export function allocationExplanation(category:string,pct:number,rp:any){
  const profile=rp?.profileName ?? "Balanced";
  const goal=rp?.answers?.objective ?? rp?.answers?.goal ?? "";
  const approach=rp?.answers?.approach ?? "";

  const reasons:string[]=[];
  if(category==="Broad U.S. Market"){
    reasons.push("This is used as a diversified core because it spreads exposure across many U.S. companies.");
  } else if(category==="International"){
    reasons.push("International exposure helps reduce dependence on the U.S. market alone.");
  } else if(category==="Technology"){
    reasons.push("Technology can support long-term growth, but the weight is controlled to limit sector concentration.");
  } else if(category==="Healthcare"){
    reasons.push("Healthcare adds exposure to businesses whose demand and economic drivers can differ from the broader market.");
  } else if(category==="Financials"){
    reasons.push("Financials add exposure to banks, insurers, and other businesses tied to credit and capital markets.");
  } else if(category==="Small-Cap / Higher Risk"){
    reasons.push("This category can add growth potential and diversification, but its weight is capped because smaller companies can be more volatile.");
  } else if(category==="Bonds"){
    reasons.push("Bonds can reduce overall volatility and provide income, especially for profiles with lower risk tolerance or capacity.");
  } else if(category==="Short-Term" || category==="Short-Term / Cash"){
    reasons.push("Short-term assets preserve liquidity and reduce the chance that near-term money is exposed to large market swings.");
  } else {
    reasons.push(`This category fills a diversification role within a ${profile.toLowerCase()} model portfolio.`);
  }

  if(profile==="Growth" || profile==="Aggressive Growth"){
    if(["Technology","Small-Cap / Higher Risk","Broad U.S. Market","International"].includes(category))
      reasons.push(`Your ${profile} profile supports a larger equity allocation, while category caps still limit overconcentration.`);
  }
  if(profile==="Protect" || profile==="Cautious"){
    if(category==="Bonds" || category==="Short-Term" || category==="Short-Term / Cash")
      reasons.push(`Your ${profile} profile places more emphasis on stability and liquidity.`);
  }
  if(approach==="funds" && !["Bonds","Short-Term","Short-Term / Cash"].includes(category)){
    reasons.push("Your preference for funds can be satisfied with diversified ETFs within this category.");
  }
  if(goal && String(goal).toLowerCase().includes("income")){
    reasons.push("Your stated income objective may also affect the balance between growth and income-oriented holdings.");
  }

  return {
    headline:`Why ${Number(pct).toFixed(1)}%?`,
    reasons
  };
}
