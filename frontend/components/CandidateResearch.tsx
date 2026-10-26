"use client";

import { useState } from "react";
import { getResearchLinks } from "@/lib/researchLinks";
import { guidanceFor } from "@/lib/researchGuidance";

type ResearchCandidate = {
  ticker: string;
  name: string;
  type: "Stock" | "ETF";
  category: string;
};

function describe({ticker,name,type,category}:ResearchCandidate):string{
  if(type==="ETF"){
    return `${name} (${ticker}) is an exchange-traded fund listed in PortfolioPath's ${category} research category. An ETF holds a collection of investments, but the number of holdings, diversification, strategy and fees vary by fund. Check the fund's official documents to understand its particular exposure.`;
  }
  return `${name} (${ticker}) is an individual company stock listed in PortfolioPath's ${category} research category. Buying shares provides an ownership interest in that business. Research its products, sources of revenue, financial health and risks before considering its place in a practice portfolio.`;
}

export default function CandidateResearch({
  investment,open,onToggle
}:{
  investment:ResearchCandidate;
  open:boolean;
  onToggle:()=>void;
}){
  const [expandedList,setExpandedList]=useState(false);
  const {ticker,name,type,category}=investment;
  const links=getResearchLinks(ticker,name,type);
  const guidance=guidanceFor(category);
  const panelId=`research-${ticker.replace(/[^a-zA-Z0-9-]/g,"-")}`;
  return <div className="researchResourceWrap">
    <button
      type="button"
      className="btn btnSecondary"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={panelId}
    >
      {open?"Hide Details & Research":"About This Investment & Research →"}
    </button>
    {open&&<div id={panelId} className="researchResourcePanel">
      <div className="researchIntro">
        <p className="sectionEyebrow">{type} · {category}</p>
        <h3>{name} ({ticker})</h3>
        <p>{describe(investment)}</p>
        <p><strong>Why this category is included:</strong> {guidance.role}</p>
      </div>
      <section className="researchResourceCard">
        <h4>Questions to consider about this investment</h4>
        <ul>{guidance.questions.slice(0,4).map(q=><li key={q}>{q}</li>)}</ul>
      </section>
      <h3>Where to research {ticker}</h3>
      <p className="muted">Start with primary documents, then compare them with independent financial data. Some links open a search for the specific investment rather than a verified official page.</p>
      {links.map((resource,i)=><section className="researchResourceCard" key={resource.title}>
        <div className="researchResourceHeader">
          <h4>{resource.title}</h4>
          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="btn btnSecondary">
            {resource.url.startsWith("https://www.google.com/search")?"Find source ↗":"Open source ↗"}
          </a>
        </div>
        <p><strong>Why this link is here:</strong> {resource.why}</p>
        <p><strong>What to look for:</strong></p>
        <ul>{(expandedList?resource.lookFor:resource.lookFor.slice(0,3)).map(x=><li key={x}>{x}</li>)}</ul>
      </section>)}
      <button className="btn btnSecondary" type="button" onClick={()=>setExpandedList(v=>!v)}>
        {expandedList?"Show shorter research checklist":"Show full research checklist"}
      </button>
      <p className="helpText" style={{marginTop:14}}>These links are for learning, not investment endorsements. Verify fund facts, company filings and dates at the source. Scores in PortfolioPath are educational examples, not live investment ratings.</p>
    </div>}
  </div>;
}
