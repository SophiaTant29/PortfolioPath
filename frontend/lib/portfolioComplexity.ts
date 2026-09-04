export type AllocationItem = { name:string; pct:number; dollars:number };

const domesticEquity = new Set([
  "Broad U.S. Market","Technology","Healthcare","Financials","Consumer",
  "Industrials","Energy","Real Estate","Small-Cap / Higher Risk"
]);

function round1(n:number){ return Math.round(n*10)/10; }
function round2(n:number){ return Math.round(n*100)/100; }

export function portfolioComplexityPlan(amount:number, approach?:string){
  const a=Number(amount||0);
  if(a>0 && a<250) return {label:"Keep it very simple", totalHoldings:{min:1,max:3}, categoryThreshold:999, collapseDomestic:true, combineStability:true};
  if(a<1000) return {label:"Keep it simple", totalHoldings:{min:2,max:4}, categoryThreshold:8, collapseDomestic:false, combineStability:true};
  if(a<5000) return {label:"Moderate complexity", totalHoldings:{min:4,max:7}, categoryThreshold:5, collapseDomestic:false, combineStability:false};
  if(a<10000) return {label:"Broader diversification", totalHoldings:{min:6,max:10}, categoryThreshold:3, collapseDomestic:false, combineStability:false};
  return {label:"Full category exploration", totalHoldings:{min:8,max:12}, categoryThreshold:0, collapseDomestic:false, combineStability:false};
}

export function simplifyAllocationForAmount(allocation:AllocationItem[], amount:number, approach?:string):AllocationItem[]{
  const rows=(allocation??[]).map(x=>({name:x.name,pct:Number(x.pct||0),dollars:Number(x.dollars||0)})).filter(x=>x.pct>0);
  if(!amount || amount>=10000) return rows;
  const plan=portfolioComplexityPlan(amount,approach);
  const map=new Map<string,number>();
  const add=(name:string,pct:number)=>map.set(name,(map.get(name)||0)+pct);

  // Very small portfolios: teach broad exposure rather than creating many tiny sector positions.
  if(plan.collapseDomestic){
    let domestic=0;
    for(const row of rows){
      if(domesticEquity.has(row.name)) domestic+=row.pct;
      else if(row.name==="Short-Term" && plan.combineStability) add("Bonds",row.pct);
      else add(row.name,row.pct);
    }
    if(domestic>0)add("Broad U.S. Market",domestic);
  }else{
    for(const row of rows){
      if(row.name==="Short-Term" && plan.combineStability){ add("Bonds",row.pct); continue; }
      if(domesticEquity.has(row.name) && row.name!=="Broad U.S. Market" && row.pct<plan.categoryThreshold){
        add("Broad U.S. Market",row.pct);
      }else add(row.name,row.pct);
    }
  }

  const simplified=[...map.entries()].map(([name,pct])=>({name,pct:round1(pct),dollars:round2(amount*pct/100)})).sort((a,b)=>b.pct-a.pct);
  // Correct small rounding drift so the displayed model totals 100%.
  const total=simplified.reduce((s,x)=>s+x.pct,0);
  if(simplified.length && Math.abs(total-100)>0.01){
    simplified[0].pct=round1(simplified[0].pct+(100-total));
    simplified[0].dollars=round2(amount*simplified[0].pct/100);
  }
  return simplified;
}

export function complexityExplanation(amount:number, allocation:AllocationItem[], simplified:AllocationItem[]){
  const plan=portfolioComplexityPlan(amount);
  if(!amount || amount>=10000) return `PortfolioPath is showing the full educational category model. The suggested total learning structure is about ${plan.totalHoldings.min}–${plan.totalHoldings.max} holdings.`;
  const reduced=Math.max(0,(allocation?.length||0)-(simplified?.length||0));
  return `${plan.label}: at $${Number(amount).toLocaleString()}, PortfolioPath suggests about ${plan.totalHoldings.min}–${plan.totalHoldings.max} total holdings. ${reduced?`${reduced} smaller category ${reduced===1?"slice has":"slices have"} been folded into broader categories so you do not end up with many tiny positions.`:"The model already fits this complexity range."} This is an educational simplification, not a recommendation.`;
}
