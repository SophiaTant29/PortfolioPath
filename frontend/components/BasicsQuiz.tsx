"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Question = {question:string; answers:[string,string,string,string]; correct:number; explanation:string};
const questions:Question[]=[
  {question:"What does owning a share of stock mean?",answers:["You own part of a company","You are lending money to the company","Your investment has a guaranteed return","You own every company in the stock market"],correct:0,explanation:"A stock is a small ownership interest in a company. Its price can increase or decrease."},
  {question:"What is an ETF?",answers:["A type of bank savings account","A fund that can hold a collection of investments","A guaranteed-return investment","A single share of one company"],correct:1,explanation:"An exchange-traded fund (ETF) trades under one ticker and can hold many investments. Some ETFs are narrowly focused, so diversification varies."},
  {question:"What is a portfolio?",answers:["Only the stocks that went up in value","A company's financial statements","The full collection of investments you own","A forecast of the market's next move"],correct:2,explanation:"A portfolio is the complete mix of investments, such as stocks, bonds, ETFs, and cash."},
  {question:"Which statement best describes investment risk?",answers:["Higher-risk investments always deliver higher returns","Risk only matters for individual stocks","Risk disappears after holding an investment for one year","Investment values can move up or down, and outcomes are uncertain"],correct:3,explanation:"Investments can gain or lose value. Greater potential returns are often associated with more uncertainty, not a promise of better outcomes."},
  {question:"Why do investors diversify?",answers:["To reduce reliance on a single company, sector, or outcome","To guarantee against market losses","To ensure every investment has the same return","To remove all possible price movements"],correct:0,explanation:"Diversification spreads exposure among different investments. It may reduce concentration risk, but it cannot guarantee no losses."},
  {question:"What does asset allocation describe?",answers:["The total number of stock exchanges","How a portfolio is divided among categories such as stocks, bonds, and cash","The price of one ETF share","How many employees a business has"],correct:1,explanation:"Asset allocation is the mix of investments in a portfolio, which can meaningfully affect its risk and return profile."},
  {question:"Why does your investment time horizon matter?",answers:["It determines the exact return you will receive","It guarantees that your investments will recover from losses","It affects how much time you have before needing invested funds","It tells you which company will grow fastest"],correct:2,explanation:"Your time horizon is how long you can invest before you may need the money. It helps frame your goals and ability to manage price fluctuations."},
  {question:"Where would you look first for an ETF's official holdings and expense ratio?",answers:["An unrelated company's investor relations page","A social media prediction","A stock price chart alone","The ETF issuer's official website"],correct:3,explanation:"An ETF issuer's website is typically the most direct source for fund holdings, operating costs, and methodology."}
];

export default function BasicsQuiz(){
  const router=useRouter();
  const params=useSearchParams();
  const next=useMemo(()=>{
    const raw=params.get("next")||"/demo";
    // In public demo mode, old account-backed portfolio URLs are redirected to the demo.
    if(!raw.startsWith("/")||raw.startsWith("//")||raw.includes("\\"))return "/demo";
    if(raw.startsWith("/portfolios/")||raw==="/dashboard"||raw.startsWith("/login"))return "/demo";
    return raw;
  },[params]);
  const [answers,setAnswers]=useState<Record<number,number>>({});
  const [submitted,setSubmitted]=useState(false);
  const count=Object.keys(answers).length;
  const score=questions.reduce((sum,q,i)=>sum+(answers[i]===q.correct?1:0),0);
  const percent=Math.round(score/questions.length*100);
  function submit(){
    if(count!==questions.length)return;
    setSubmitted(true);
    try{localStorage.setItem("portfoliopath-basics-quiz",JSON.stringify({score,total:questions.length,completedAt:new Date().toISOString()}));}catch{}
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function reset(){
    setAnswers({});setSubmitted(false);
    window.scrollTo({top:0,behavior:"smooth"});
  }
  return <div className="lessonShell">
    <section className="panel" style={{marginBottom:16}}>
      <p className="sectionEyebrow">PortfolioPath · Learn the Basics</p>
      <h1>Knowledge Check</h1>
      <p>Eight quick questions about what you just learned. This is a practice check, not a test you need to pass to continue.</p>
      {!submitted?<p className="muted">{count} of {questions.length} answered</p>:<div className="lessonCallout"><strong>You scored {score} of {questions.length} ({percent}%).</strong><span>{score===questions.length?"Great work — you understood each concept.":"Review the explanations below to strengthen what you learned."}</span></div>}
    </section>
    {questions.map((q,i)=><section className="card" key={i} style={{marginBottom:14}}>
      <p className="sectionEyebrow">Question {i+1} of {questions.length}</p>
      <h2 style={{fontSize:"1.1rem"}}>{q.question}</h2>
      <div role="radiogroup" aria-label={q.question} style={{display:"grid",gap:10,marginTop:14}}>
        {q.answers.map((label,j)=><label key={j} className="lessonMiniCard" style={{display:"flex",alignItems:"center",gap:10,cursor:submitted?"default":"pointer",borderColor:submitted&&j===q.correct?"#27865c":undefined}}>
          <input type="radio" name={`knowledge-check-${i}`} checked={answers[i]===j} disabled={submitted} onChange={()=>setAnswers(a=>({...a,[i]:j}))}/>
          <span>{label}</span>
        </label>)}
      </div>
      {submitted&&<div className={`lessonFeedback ${answers[i]===q.correct?"correct":"tryAgain"}`} role="status" style={{marginTop:12}}>
        <strong>{answers[i]===q.correct?"Correct!":`Review: ${q.answers[q.correct]}`}</strong>
        <p style={{marginBottom:0}}>{q.explanation}</p>
      </div>}
    </section>)}
    <section className="panel">
      {!submitted?<div className="actions">
        <button className="btn btnPrimary" type="button" disabled={count!==questions.length} onClick={submit}>Check My Answers</button>
        <Link href="/learn/basics" className="btn btnSecondary">Review Lesson</Link>
        <button className="btn btnSecondary" type="button" onClick={()=>router.push(next)}>Skip Quiz & Continue</button>
      </div>:<div className="actions">
        <button className="btn btnPrimary" type="button" onClick={()=>router.push(next)}>Continue to Portfolio Builder →</button>
        <button className="btn btnSecondary" type="button" onClick={reset}>Try Again</button>
        <Link href="/learn/basics" className="btn btnSecondary">Review Lesson</Link>
      </div>}
      <p className="helpText" style={{marginTop:12}}>Your quiz score stays in this browser only. It is not shared with a PortfolioPath account.</p>
    </section>
  </div>;
}
