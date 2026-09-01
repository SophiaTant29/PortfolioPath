import Link from "next/link";

export default function PortfolioProgress({id,portfolio,selections}:{id:string;portfolio:any;selections:any[]}){
  const steps=[
    {name:"Investor Profile",done:!!portfolio.risk_profile,href:`/portfolios/${id}/questionnaire`},
    {name:"Recommended Allocation",done:!!portfolio.risk_profile,href:`/portfolios/${id}/recommendation`},
    {name:"Build Portfolio",done:(selections?.length??0)>0,href:`/portfolios/${id}/build?step=0`},
    {name:"Portfolio Review",done:(selections?.length??0)>0,href:`/portfolios/${id}/review`},
    {name:"Insights",done:(selections?.length??0)>0,href:`/portfolios/${id}/insights`},
  ];

  return <div className="card">
    <strong id="portfolio-progress-heading">Portfolio Setup Progress</strong>
    <div aria-labelledby="portfolio-progress-heading" style={{display:"grid",gap:8,marginTop:12}}>
      {steps.map(s=><div key={s.name} style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center"}}>
        <span><span aria-hidden="true">{s.done?"✓":"○"}</span><span className="srOnly">{s.done?"Completed":"Not completed"}: </span> {s.name}</span>
        <Link className="btn btnSecondary" href={s.href}>{s.done?"Open":"Start"}</Link>
      </div>)}
    </div>
  </div>;
}
