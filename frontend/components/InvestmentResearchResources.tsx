"use client";
import { useState } from "react";
import { getResearchLinks } from "@/lib/researchLinks";

export default function InvestmentResearchResources({
  ticker,name,type
}:{ticker:string;name:string;type:"Stock"|"ETF"}) {
  const [open,setOpen]=useState(false);
  const resources=getResearchLinks(ticker,name,type);
  return (
    <div className="researchResourceWrap">
      <button className="btn btnSecondary" type="button" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>
        {open ? "Hide research resources" : "Research this investment"}
      </button>
      {open && <div className="researchResourcePanel">
        <div className="researchIntro">
          <strong>Don’t just open links — know what you are looking for.</strong>
          <p>Use these sources to understand the investment from several angles before deciding whether it belongs in your portfolio.</p>
        </div>
        {resources.map(r=><div className="researchResourceCard" key={r.title}>
          <div className="researchResourceHeader">
            <h4>{r.title}</h4>
            <a className="btn btnSecondary" href={r.url} target="_blank" rel="noreferrer">Open resource ↗</a>
          </div>
          <p><strong>Why this link is here:</strong> {r.why}</p>
          <p><strong>What to look for:</strong></p>
          <ul>{r.lookFor.map(item=><li key={item}>{item}</li>)}</ul>
        </div>)}
      </div>}
    </div>
  );
}
