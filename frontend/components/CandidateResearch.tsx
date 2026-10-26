"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getResearchLinks } from "@/lib/researchLinks";
import { guidanceFor } from "@/lib/researchGuidance";

type ResearchCandidate = {
  ticker: string;
  name: string;
  type: "Stock" | "ETF";
  category: string;
};

function describe({ticker,name,type,category}:ResearchCandidate):string {
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
  const triggerRef=useRef<HTMLButtonElement>(null);
  const modalRef=useRef<HTMLDivElement>(null);
  const closeRef=useRef<HTMLButtonElement>(null);
  const onToggleRef=useRef(onToggle);
  onToggleRef.current=onToggle;
  const {ticker,name,type,category}=investment;
  const links=getResearchLinks(ticker,name,type);
  const guidance=guidanceFor(category);
  const titleId=`research-title-${ticker.replace(/[^a-zA-Z0-9-]/g,"-")}`;

  useEffect(()=>{
    if(!open)return;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    closeRef.current?.focus();

    function onKeyDown(event:KeyboardEvent){
      if(event.key==="Escape"){
        event.preventDefault();
        onToggleRef.current();
      }
      if(event.key==="Tab" && modalRef.current){
        const items=Array.from(modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ));
        if(!items.length){event.preventDefault();return;}
        const first=items[0],last=items[items.length-1];
        if(event.shiftKey && document.activeElement===first){
          event.preventDefault();last.focus();
        }else if(!event.shiftKey && document.activeElement===last){
          event.preventDefault();first.focus();
        }
      }
    }
    document.addEventListener("keydown",onKeyDown);
    return ()=>{
      document.body.style.overflow=previousOverflow;
      document.removeEventListener("keydown",onKeyDown);
      triggerRef.current?.focus();
    };
  },[open]);

  return <>
    <button
      ref={triggerRef}
      type="button"
      className="candidateNameButton"
      onClick={onToggle}
      aria-haspopup="dialog"
      aria-expanded={open}
    >
      <span className="candidateSymbol">{ticker}</span>
      <span className="candidateName">{name}</span>
      <span className="candidateNameArrow" aria-hidden="true">↗</span>
    </button>

    {open && typeof document!=="undefined" && createPortal(
      <div
        className="researchModalBackdrop"
        onMouseDown={event=>{if(event.target===event.currentTarget)onToggle();}}
      >
        <div
          ref={modalRef}
          className="researchModal"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <header className="researchModalTop">
            <div className="researchModalBrand">
              <span className="researchModalBrandMark" aria-hidden="true">P</span>
              <span>PortfolioPath <span className="researchModalBrandDivider">/ Research library</span></span>
            </div>
            <button type="button" className="researchModalClose" ref={closeRef} onClick={onToggle} aria-label="Close investment research">✕ <span>Close</span></button>
          </header>
          <div className="researchModalScroll">
            <div className="researchModalHero">
              <span className="sectionEyebrow">{type} · {category}</span>
              <h2 id={titleId}>{name}</h2>
              <div className="researchModalTicker">{ticker}</div>
              <p className="researchModalDescription">{describe(investment)}</p>
            </div>
            <div className="researchModalContent">
              <div className="researchModalOverview">
                <section className="researchModalInfoCard">
                  <span className="researchModalLabel">01 / Portfolio context</span>
                  <h3>Why explore this investment?</h3>
                  <p>{guidance.role}</p>
                </section>
                <section className="researchModalInfoCard">
                  <span className="researchModalLabel">02 / Research checklist</span>
                  <h3>Questions worth asking</h3>
                  <ul>{guidance.questions.slice(0,4).map(q=><li key={q}>{q}</li>)}</ul>
                </section>
              </div>

              <div className="researchModalSectionHeading">
                <div>
                  <span className="researchModalLabel">03 / Research resources</span>
                  <h3>Where to research {ticker}</h3>
                  <p>Each source answers a different question. Use the guides below so you know what to look for.</p>
                </div>
                <button type="button" className="btn btnSecondary" onClick={()=>setExpandedList(v=>!v)}>
                  {expandedList?"Shorten checklists":"Show full checklists"}
                </button>
              </div>
              <div className="researchModalResourceGrid">
                {links.map((resource,i)=><section className="researchModalResource" key={resource.title}>
                  <div className="researchModalResourceNumber">RESOURCE {String(i+1).padStart(2,"0")}</div>
                  <h4>{resource.title}</h4>
                  <p><strong>Why it's useful</strong></p>
                  <p>{resource.why}</p>
                  <p><strong>What to look for</strong></p>
                  <ul>{(expandedList?resource.lookFor:resource.lookFor.slice(0,3)).map(x=><li key={x}>{x}</li>)}</ul>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="researchModalResourceLink">
                    {resource.url.startsWith("https://www.google.com/search")?"Find this source":"Open research source"} <span aria-hidden="true">↗</span>
                  </a>
                </section>)}
              </div>
              <p className="researchModalFootnote">Some links open search results rather than a verified official page. Verify details and dates at the source. This is an educational exercise, not a recommendation or live investment rating.</p>
            </div>
          </div>
          <footer className="researchModalFooter">
            <span>Research first. Decide with understanding.</span>
            <button type="button" className="btn btnPrimary" onClick={onToggle}>Back to portfolio options</button>
          </footer>
        </div>
      </div>,
      document.body
    )}
  </>;
}
