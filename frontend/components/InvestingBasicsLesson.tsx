"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Slide = {
  number: string;
  eyebrow: string;
  title: string;
  intro: string;
  kind: "welcome" | "stock" | "etf" | "portfolio" | "risk" | "diversification" | "goals" | "research" | "sources" | "complete";
  takeaway?: string;
  why?: string;
};

const slides: Slide[] = [
  {
    number:"1 / 10", eyebrow:"Welcome to PortfolioPath", kind:"welcome",
    title:"Before You Build, Learn the Basics",
    intro:"This quick intro covers the core ideas you need before building a portfolio — in plain language, no jargon required.",
    takeaway:"A few clear concepts now will make the questionnaire, allocation, and builder easier to understand."
  },
  {
    number:"2 / 10", eyebrow:"01 · Core concept", kind:"stock",
    title:"What Is a Stock?",
    intro:"A stock represents partial ownership in a company — buy a share, own a small slice of the business.",
    takeaway:"Higher growth potential usually comes with more risk.",
    why:"Understanding what a share represents helps you read price moves as business information, not just numbers on a screen."
  },
  {
    number:"3 / 10", eyebrow:"02 · Core concept", kind:"etf",
    title:"What Is an ETF?",
    intro:"An ETF (exchange-traded fund) holds a group of investments and trades under a single ticker — one purchase, many holdings.",
    takeaway:"One ETF can provide more diversification than one stock.",
    why:"ETFs can give beginners broad exposure without requiring them to analyze dozens of companies individually."
  },
  {
    number:"4 / 10", eyebrow:"03 · Core concept", kind:"portfolio",
    title:"What Is a Portfolio?",
    intro:"A portfolio is the full collection of investments someone owns. The goal is not just picking ‘good stocks’ — it is building pieces that work together.",
    takeaway:"Your overall mix matters more than any single investment.",
    why:"Thinking about the whole portfolio instead of one lucky pick is a key long-term investing mindset."
  },
  {
    number:"5 / 10", eyebrow:"04 · Core concept", kind:"risk",
    title:"Risk vs. Return",
    intro:"More potential return usually means accepting more uncertainty along the way.",
    takeaway:"More potential return usually means accepting more uncertainty.",
    why:"This is what later questionnaire questions about risk tolerance and time horizon are trying to understand."
  },
  {
    number:"6 / 10", eyebrow:"05 · Core concept", kind:"diversification",
    title:"Why Diversification Matters",
    intro:"Diversification means spreading exposure across many holdings instead of relying heavily on one company or sector.",
    takeaway:"Diversification is about balance, not owning as many investments as possible.",
    why:"A setback in one area may have less impact when the rest of the portfolio has different exposures."
  },
  {
    number:"7 / 10", eyebrow:"06 · Core concept", kind:"goals",
    title:"Different Investment Goals",
    intro:"The goal you are investing toward can shape how a portfolio is structured.",
    takeaway:"Different goals can lead to very different portfolio structures.",
    why:"Naming a goal first keeps later research and risk decisions anchored to a purpose."
  },
  {
    number:"8 / 10", eyebrow:"07 · Research skills", kind:"research",
    title:"How to Research an Investment",
    intro:"Know what you want to learn before you click through to a research website.",
    takeaway:"Open a research website with a question you want answered.",
    why:"A short checklist turns a wall of financial information into a few answerable questions."
  },
  {
    number:"9 / 10", eyebrow:"07 · Research skills", kind:"sources",
    title:"Where to Research",
    intro:"Each source is useful for a different question — know which one to open before you start.",
    takeaway:"Match the question to the source. Do not rely on one website for everything.",
    why:"PortfolioPath should teach you how to use research links, not just hand you a list of them."
  },
  {
    number:"10 / 10", eyebrow:"Lesson complete", kind:"complete",
    title:"You’re Ready to Build",
    intro:"You now have the foundation to ask better questions as you build your learning portfolio.",
    takeaway:"Learn first. Build second. Review what you learned."
  }
];

const concepts = ["Stocks","ETFs","Portfolios","Risk vs. return","Diversification","Goals","Research"];

function Bullet({children}:{children:ReactNode}){
  return <li><span className="lessonBulletDot" aria-hidden="true" /> <span>{children}</span></li>;
}

export default function InvestingBasicsLesson(){
  const router=useRouter();
  const searchParams=useSearchParams();
  const [index,setIndex]=useState(0);
  const [divAnswer,setDivAnswer]=useState<"A"|"B"|null>(null);
  const [researchAnswer,setResearchAnswer]=useState<string|null>(null);
  const slide=slides[index];
  const progress=((index+1)/slides.length)*100;

  const hasQuestionnaireNext=Boolean(searchParams.get("next")?.includes("/questionnaire"));
  const nextPath=useMemo(()=>{
    const raw=searchParams.get("next") || "/demo";
    return raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\") ? raw : "/demo";
  },[searchParams]);

  useEffect(()=>{
    window.scrollTo({top:0,behavior:"smooth"});
  },[index]);

  function finish(){
    try{localStorage.setItem("portfoliopath-basics-completed","1");}catch{}
    router.push(`/learn/basics/quiz?next=${encodeURIComponent(nextPath)}`);
  }

  function skip(){
    try{localStorage.setItem("portfoliopath-basics-skipped","1");}catch{}
    router.push(nextPath);
  }

  function renderBody(){
    switch(slide.kind){
      case "welcome": return <>
        <div className="lessonConceptGrid">{concepts.map(c=><div className="lessonConcept" key={c}>{c}</div>)}</div>
        <div className="lessonCallout"><strong>About 3 minutes.</strong><span>You can skip now and come back anytime from the Learning Center.</span></div>
      </>;
      case "stock": return <>
        <div className="lessonFlow"><div><strong>Company</strong><span>Runs the business</span></div><b>→</b><div><strong>Shares</strong><span>Tradable ownership units</span></div><b>→</b><div><strong>Investors</strong><span>Own part of the company</span></div></div>
        <div className="lessonTwoCol"><div className="lessonMiniCard"><strong>Prices move</strong><p>Stock prices rise and fall based on company performance, expectations, news, and overall market conditions.</p></div><div className="lessonMiniCard"><strong>Dividends</strong><p>Some companies distribute part of their earnings to shareholders through dividends. Dividends are not guaranteed.</p></div></div>
      </>;
      case "etf": return <>
        <div className="lessonBigStat"><span>ONE ETF CAN HOLD</span><strong>Hundreds</strong><p>of individual companies inside a single fund.</p></div>
        <div className="lessonTwoCol"><div className="lessonMiniCard"><strong>Broad-market ETF</strong><p>Can spread exposure across many industries and company sizes.</p></div><div className="lessonMiniCard"><strong>Sector ETF</strong><p>Focuses on one industry, such as technology or healthcare.</p></div></div>
        <div className="lessonWarning">Not all ETFs are alike. Some concentrate in one sector or theme and can still carry substantial risk.</div>
      </>;
      case "portfolio": return <>
        <div className="lessonAllocation"><div><span>Stocks</span><strong>55%</strong></div><div><span>Bonds</span><strong>30%</strong></div><div><span>Cash</span><strong>15%</strong></div></div>
        <p className="lessonExampleLabel">Illustrative example only</p>
        <div className="lessonMiniCard"><strong>Asset allocation</strong><p>How money is divided across stocks, bonds, cash, and other assets. Different mixes can create very different risk profiles.</p></div>
      </>;
      case "risk": return <>
        <div className="riskLabels"><strong>Generally lower risk / lower return potential</strong><strong>Generally higher risk / higher return potential</strong></div>
        <div className="riskTrack"><span>Cash</span><span>Bonds</span><span>Broad ETFs</span><span>Individual stocks</span><span>Concentrated / sector bets</span></div>
        <div className="lessonWarning">This is simplified, not a guarantee. Real investments do not line up this neatly, and past patterns do not guarantee future results.</div>
      </>;
      case "diversification": return <>
        <div className="lessonTwoCol">
          <button type="button" className={`lessonChoice ${divAnswer==="A"?"selected":""}`} onClick={()=>setDivAnswer("A")}><span>Portfolio A</span><strong>100% Technology</strong><small>One sector drives the entire outcome.</small></button>
          <button type="button" className={`lessonChoice ${divAnswer==="B"?"selected":""}`} onClick={()=>setDivAnswer("B")}><span>Portfolio B</span><strong>Tech + Healthcare + Broad Market + International</strong><small>Exposure is spread across sectors and regions.</small></button>
        </div>
        <p className="lessonPrompt">Quick check: Which portfolio is more diversified?</p>
        {divAnswer&&<div className={`lessonFeedback ${divAnswer==="B"?"correct":"tryAgain"}`}>{divAnswer==="B"?"Correct. Portfolio B spreads exposure across more areas, although diversification still cannot eliminate losses.":"Portfolio A is highly concentrated. Portfolio B is the more diversified example."}</div>}
        <p className="muted">Also watch for ETF overlap: different funds can still own many of the same underlying companies.</p>
      </>;
      case "goals": return <>
        <div className="goalGrid"><div><strong>Growth</strong><span>Increase value over many years</span></div><div><strong>Income</strong><span>Receive dividends or interest</span></div><div><strong>Stability</strong><span>Prioritize lower volatility</span></div><div><strong>Capital preservation</strong><span>Focus more on protecting money</span></div></div>
        <div className="lessonMiniCard"><strong>Time and risk also matter</strong><p>Time horizon and risk tolerance can affect how aggressively a portfolio might pursue a goal. PortfolioPath uses these concepts for education, not personalized financial advice.</p></div>
      </>;
      case "research": return <>
        <div className="lessonTwoCol"><div className="lessonChecklist"><strong>For a stock</strong><ul><Bullet>What does the company do?</Bullet><Bullet>Is revenue or profit growing?</Bullet><Bullet>How much debt does it have?</Bullet><Bullet>How does valuation compare with peers?</Bullet><Bullet>What risks does management discuss?</Bullet></ul></div><div className="lessonChecklist"><strong>For an ETF</strong><ul><Bullet>What does it track?</Bullet><Bullet>What companies does it hold?</Bullet><Bullet>What is the expense ratio?</Bullet><Bullet>What are the top holdings?</Bullet><Bullet>How concentrated is it?</Bullet></ul></div></div>
      </>;
      case "sources": return <>
        <div className="sourceGrid"><div><strong>Company Investor Relations</strong><span>Official reports and business updates</span></div><div><strong>SEC</strong><span>Official filings and disclosed risks</span></div><div><strong>Yahoo Finance</strong><span>Quick financial overview and snapshot</span></div><div><strong>Morningstar</strong><span>Fund and company characteristics</span></div><div><strong>ETF issuer</strong><span>Holdings, fees, and methodology</span></div></div>
        <p className="lessonPrompt">Quick check: Where would you first look for an ETF’s official holdings and expense ratio?</p>
        <div className="lessonQuizButtons">{["SEC","ETF issuer","Company Investor Relations"].map(answer=><button type="button" key={answer} className="btn btnSecondary" onClick={()=>setResearchAnswer(answer)}>{answer}</button>)}</div>
        {researchAnswer&&<div className={`lessonFeedback ${researchAnswer==="ETF issuer"?"correct":"tryAgain"}`}>{researchAnswer==="ETF issuer"?"Correct. The fund issuer is usually the most direct source for current holdings, fees, and methodology.":"A useful source, but the ETF issuer is usually the most direct place for holdings, fees, and methodology."}</div>}
      </>;
      case "complete": return <>
        <div className="lessonRecap">{[
          ["Stocks","ownership"],["ETFs","baskets of investments"],["Portfolio","the full mix"],["Risk vs. return","more potential gain can mean more uncertainty"],["Diversification","spreading exposure"],["Research","understanding what you are choosing"]
        ].map(([a,b])=><div key={a}><strong>{a}</strong><span>{b}</span></div>)}</div>
        <div className="lessonPath"><span>Questionnaire</span><b>→</b><span>Educational Model Allocation</span><b>→</b><span>Explore</span><b>→</b><span>Build</span><b>→</b><span>Review</span></div>
      </>;
    }
  }

  return <div className="lessonShell">
    <div className="lessonTopline"><div><span className="sectionEyebrow">PortfolioPath · Learn the Basics</span><h1>{slide.title}</h1></div><span className="statusBadge statusInfo">{slide.number}</span></div>
    <div className="progressTrack lessonProgress" aria-label={`Lesson progress: ${index+1} of ${slides.length}`}><div className="progressFill" style={{width:`${progress}%`}} /></div>

    <section className="lessonStage" aria-live="polite">
      <div className="lessonEyebrow">{slide.eyebrow}</div>
      <p className="lessonIntro">{slide.intro}</p>
      <div className="lessonBody">{renderBody()}</div>
      {slide.takeaway&&<div className="lessonTakeaway"><span>Key takeaway</span><strong>{slide.takeaway}</strong></div>}
      {slide.why&&<div className="lessonWhy"><span>Why this matters</span><p>{slide.why}</p></div>}
    </section>

    <div className="lessonNav">
      <button type="button" className="btn btnSecondary" onClick={()=>setIndex(i=>Math.max(0,i-1))} disabled={index===0}>← Back</button>
      <div className="lessonDots" aria-label="Lesson slides">{slides.map((_,i)=><button key={i} type="button" aria-label={`Go to slide ${i+1}`} aria-current={i===index?"step":undefined} className={i===index?"active":""} onClick={()=>setIndex(i)} />)}</div>
      {index===slides.length-1?<button type="button" className="btn btnPrimary" onClick={finish}>{"Take Knowledge Check →"}</button>:<button type="button" className="btn btnPrimary" onClick={()=>setIndex(i=>Math.min(slides.length-1,i+1))}>Next →</button>}
    </div>
    {index<slides.length-1&&<button type="button" className="lessonSkip" onClick={skip}>Skip for now</button>}
  </div>;
}
