export function allocationByCategory(rows:any[]){
  const out:Record<string,number>={};
  for(const r of rows){
    out[r.category]=(out[r.category]??0)+Number(r.planned_amount??0);
  }
  return out;
}

export function largestPosition(rows:any[]){
  if(!rows.length)return null;
  const total=rows.reduce((s,r)=>s+Number(r.planned_amount??0),0)||1;
  const largest=rows.reduce((a,b)=>Number(a.planned_amount)>Number(b.planned_amount)?a:b);
  return {...largest,pct:Number(largest.planned_amount)/total*100};
}

export function simpleHealthScore(rows:any[],latestPerformance:any){
  if(!rows.length)return 0;
  const total=rows.reduce((s,r)=>s+Number(r.planned_amount??0),0)||1;
  const largest=Math.max(...rows.map(r=>Number(r.planned_amount??0)/total*100));
  const categories=new Set(rows.map(r=>r.category)).size;

  let score=100;
  if(largest>25)score-=25;
  else if(largest>15)score-=12;

  if(categories<3)score-=15;
  else if(categories<5)score-=7;

  if(latestPerformance?.max_drawdown!=null && Number(latestPerformance.max_drawdown)<=-30)score-=10;
  if(latestPerformance?.excess_return!=null && Number(latestPerformance.excess_return)<-8)score-=8;

  return Math.max(0,Math.round(score));
}
