export function suggestedHoldingCount(totalInvestment:number|undefined, categoryPct:number, typePreference?:string) {
  const pct=Number(categoryPct||0);
  const total=Number(totalInvestment||0);
  const categoryDollars=total>0 ? total*(pct/100) : 0;

  // If the user prefers funds, fewer holdings are generally needed because ETFs can already be diversified.
  if(typePreference==="funds"){
    if(pct>=20) return {min:1,max:2};
    return {min:1,max:1};
  }

  if(total<=0){
    if(pct>=25)return {min:2,max:4};
    if(pct>=12)return {min:1,max:3};
    return {min:1,max:2};
  }

  if(total<250)return {min:1,max:1};
  if(total<1000)return {min:1,max:2};
  if(categoryDollars<750)return {min:1,max:1};
  if(categoryDollars<2000)return {min:1,max:2};
  if(categoryDollars<5000)return {min:2,max:3};
  if(categoryDollars<10000)return {min:2,max:4};
  return {min:3,max:5};
}

export function equalWeightSuggestion(categoryAmount:number, count:number) {
  if(!count || count<1)return 0;
  return categoryAmount/count;
}

export function positionSizingExplanation(total:number|undefined, categoryPct:number, count:{min:number;max:number}, preference?:string) {
  if(preference==="funds"){
    return `Because diversified funds can already hold many securities, This learning structure uses about ${count.min}${count.max!==count.min?`–${count.max}`:""} fund${count.max>1?"s":""} in this category.`;
  }
  if(!total){
    return `Without a dollar amount, This learning structure uses about ${count.min}${count.max!==count.min?`–${count.max}`:""} holding${count.max>1?"s":""} for this ${Number(categoryPct).toFixed(1)}% category.`;
  }
  return `Based on your planned investment and this category's size, This learning structure uses about ${count.min}${count.max!==count.min?`–${count.max}`:""} holding${count.max>1?"s":""}. This is a diversification guideline, not a requirement.`;
}
