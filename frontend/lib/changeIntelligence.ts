export type ScoreSnapshot = {
  id?: string;
  symbol: string;
  match_score?: number | null;
  quality_score?: number | null;
  estimated_risk?: number | null;
  score_payload?: any;
  snapshot_date?: string;
  created_at?: string;
};

export type ChangeAlert = {
  severity: "Info" | "Consider" | "Important";
  title: string;
  body: string;
  symbol?: string;
  href?: string;
};

function n(v:any){
  const x=Number(v);
  return Number.isFinite(x)?x:null;
}

export function compareScoreSnapshots(
  current:ScoreSnapshot,
  previous:ScoreSnapshot | null,
  portfolioId?:string
):ChangeAlert[]{
  if(!previous)return [];

  const out:ChangeAlert[]=[];
  const matchNow=n(current.match_score), matchOld=n(previous.match_score);
  const qualNow=n(current.quality_score), qualOld=n(previous.quality_score);
  const riskNow=n(current.estimated_risk), riskOld=n(previous.estimated_risk);

  if(matchNow!=null && matchOld!=null){
    const d=matchNow-matchOld;
    if(d<=-10)out.push({
      severity:"Important",
      title:`${current.symbol} Research Relevance score fell`,
      body:`Research Relevance decreased ${Math.abs(d).toFixed(0)} points, from ${matchOld.toFixed(0)}% to ${matchNow.toFixed(0)}%.`,
      symbol:current.symbol,
      href:portfolioId?`/research/${current.symbol}?portfolio=${portfolioId}`:undefined
    });
    else if(d<=-5)out.push({
      severity:"Consider",
      title:`${current.symbol} Research Relevance score weakened`,
      body:`Research Relevance decreased ${Math.abs(d).toFixed(0)} points since the prior snapshot.`,
      symbol:current.symbol,
      href:portfolioId?`/research/${current.symbol}?portfolio=${portfolioId}`:undefined
    });
    else if(d>=8)out.push({
      severity:"Info",
      title:`${current.symbol} Research Relevance score improved`,
      body:`Research Relevance increased ${d.toFixed(0)} points since the prior snapshot.`,
      symbol:current.symbol,
      href:portfolioId?`/research/${current.symbol}?portfolio=${portfolioId}`:undefined
    });
  }

  if(qualNow!=null && qualOld!=null){
    const d=qualNow-qualOld;
    if(d<=-8)out.push({
      severity:"Consider",
      title:`${current.symbol} quality score declined`,
      body:`Objective quality decreased ${Math.abs(d).toFixed(0)} points.`,
      symbol:current.symbol
    });
  }

  if(riskNow!=null && riskOld!=null){
    const d=riskNow-riskOld;
    if(d>=12)out.push({
      severity:"Consider",
      title:`${current.symbol} risk increased`,
      body:`Estimated risk increased ${d.toFixed(0)} points since the prior snapshot.`,
      symbol:current.symbol
    });
  }

  const nowScores=current.score_payload?.scores??{};
  const oldScores=previous.score_payload?.scores??{};
  const labels:Record<string,string>={
    growth:"Growth",
    profitability:"Profitability",
    financial_strength:"Financial strength",
    valuation:"Valuation",
    stability:"Stability",
    dividend:"Dividend profile"
  };

  for(const key of Object.keys(labels)){
    const a=n(nowScores[key]), b=n(oldScores[key]);
    if(a==null||b==null)continue;
    const d=a-b;
    if(d<=-12){
      out.push({
        severity:"Consider",
        title:`${current.symbol} ${labels[key]} weakened`,
        body:`${labels[key]} fell ${Math.abs(d).toFixed(0)} points versus the prior score snapshot.`,
        symbol:current.symbol
      });
    }
  }

  return out;
}

export function portfolioStructureAlerts(
  selections:any[],
  targetAllocation:any[],
  latestPerformance:any,
  portfolioId:string
):ChangeAlert[]{
  const out:ChangeAlert[]=[];
  const total=selections.reduce((s,r)=>s+Number(r.planned_amount??0),0)||1;

  const largest=selections
    .map(r=>({...r,pct:Number(r.planned_amount??0)/total*100}))
    .sort((a,b)=>b.pct-a.pct)[0];

  if(largest?.pct>25){
    out.push({
      severity:"Important",
      title:"High single-position concentration",
      body:`${largest.symbol} represents ${largest.pct.toFixed(1)}% of the selected portfolio.`,
      href:`/portfolios/${portfolioId}/insights`
    });
  }else if(largest?.pct>15){
    out.push({
      severity:"Consider",
      title:"Position concentration is elevated",
      body:`${largest.symbol} represents ${largest.pct.toFixed(1)}% of the selected portfolio.`,
      href:`/portfolios/${portfolioId}/insights`
    });
  }

  const byCategory:Record<string,number>={};
  for(const r of selections)byCategory[r.category]=(byCategory[r.category]??0)+Number(r.planned_amount??0);

  for(const t of targetAllocation??[]){
    const current=(byCategory[t.name]??0)/total*100;
    const diff=current-Number(t.pct??0);
    if(diff>=8){
      out.push({
        severity:"Consider",
        title:`${t.name} is above target`,
        body:`Current allocation is ${current.toFixed(1)}% versus a ${Number(t.pct).toFixed(1)}% target.`,
        href:`/portfolios/${portfolioId}/insights`
      });
    }
  }

  if(latestPerformance?.excess_return!=null && Number(latestPerformance.excess_return)<=-8){
    out.push({
      severity:"Important",
      title:"Portfolio materially trails benchmark",
      body:`The portfolio is behind the benchmark by ${Math.abs(Number(latestPerformance.excess_return)).toFixed(1)} percentage points.`,
      href:`/portfolios/${portfolioId}/performance`
    });
  }

  if(latestPerformance?.max_drawdown!=null && Number(latestPerformance.max_drawdown)<=-25){
    out.push({
      severity:"Important",
      title:"Large portfolio drawdown",
      body:`Maximum drawdown has reached ${Number(latestPerformance.max_drawdown).toFixed(1)}%.`,
      href:`/portfolios/${portfolioId}/performance`
    });
  }

  return out;
}

export function sortAlerts(alerts:ChangeAlert[]){
  const rank={Important:3,Consider:2,Info:1};
  return alerts.slice().sort((a,b)=>rank[b.severity]-rank[a.severity]);
}
