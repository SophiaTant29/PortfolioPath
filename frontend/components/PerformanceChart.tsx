"use client";

type Row={
  date:string;
  portfolio_growth:number;
  benchmark_growth:number;
};

export default function PerformanceChart({series}:{series:Row[]}){
  if(!series.length){
    return <div className="card"><p className="muted">No historical performance data yet.</p></div>
  }

  const W=900,H=340,pad={l:55,r:20,t:20,b:42};
  const vals=series.flatMap(s=>[s.portfolio_growth,s.benchmark_growth]);
  let min=Math.min(...vals),max=Math.max(...vals);
  if(min===max){min-=1;max+=1}
  const range=max-min;
  min-=range*.08; max+=range*.08;

  const x=(i:number)=>pad.l+(i/(series.length-1||1))*(W-pad.l-pad.r);
  const y=(v:number)=>pad.t+(max-v)/(max-min)*(H-pad.t-pad.b);

  const path=(key:"portfolio_growth"|"benchmark_growth")=>
    series.map((s,i)=>`${i===0?"M":"L"}${x(i)} ${y(s[key])}`).join(" ");

  const grid=[0,1,2,3,4].map(i=>min+(max-min)*i/4);
  const marks=[0,Math.floor(series.length/2),series.length-1];

  return (
    <div className="card">
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto"}} role="img" aria-label="Portfolio versus S&P 500 performance chart">
        {grid.map(v=><g key={v}>
          <line x1={pad.l} x2={W-pad.r} y1={y(v)} y2={y(v)} stroke="#e5e9f0"/>
          <text x={pad.l-8} y={y(v)+4} textAnchor="end" fontSize="11" fill="#667085">{v.toFixed(0)}</text>
        </g>)}
        <path d={path("portfolio_growth")} fill="none" stroke="#1f6feb" strokeWidth="3" strokeLinejoin="round"/>
        <path d={path("benchmark_growth")} fill="none" stroke="#68707d" strokeWidth="3" strokeLinejoin="round"/>
        {[...new Set(marks)].map(i=><text key={i} x={x(i)} y={H-15} textAnchor="middle" fontSize="11" fill="#667085">{series[i].date.slice(5)}</text>)}
      </svg>
      <div style={{display:"flex",gap:18,flexWrap:"wrap",fontSize:12,color:"#667085"}}>
        <span>Portfolio growth of $100</span>
        <span>S&P 500 growth of $100</span>
      </div>
    </div>
  );
}
