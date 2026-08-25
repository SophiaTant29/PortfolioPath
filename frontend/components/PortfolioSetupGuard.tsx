import Link from "next/link";

export default function PortfolioSetupGuard({
  portfolioId,
  portfolio,
  requireProfile=false,
  requireSelections=false,
  selections=[]
}:{
  portfolioId:string;
  portfolio:any;
  requireProfile?:boolean;
  requireSelections?:boolean;
  selections?:any[];
}){
  if(!portfolio){
    return <section className="panel"><h1>Portfolio not found</h1></section>;
  }

  if(requireProfile && !portfolio.risk_profile){
    return <section className="panel">
      <h1>Complete your investor profile first</h1>
      <p className="muted">This section depends on the questionnaire and recommended allocation.</p>
      <Link className="btn btnPrimary" href={`/portfolios/${portfolioId}/questionnaire`}>Start Questionnaire</Link>
    </section>;
  }

  if(requireSelections && (selections?.length??0)===0){
    return <section className="panel">
      <h1>Build your portfolio first</h1>
      <p className="muted">Select at least one planned investment before using this section.</p>
      <Link className="btn btnPrimary" href={`/portfolios/${portfolioId}/build?step=0`}>Build Portfolio</Link>
    </section>;
  }

  return null;
}
