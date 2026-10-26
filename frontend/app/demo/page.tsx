"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { calculateInvestorProfile, type QuestionnaireAnswers } from "@/lib/investorProfile";
import { simplifyAllocationForAmount, portfolioComplexityPlan } from "@/lib/portfolioComplexity";
import { securityUniverse } from "@/lib/securityUniverse";
import CandidateResearch from "@/components/CandidateResearch";
import PortfolioAnalysisDashboard from "@/components/PortfolioAnalysisDashboard";

const KEY="portfoliopath-public-demo-v1";
const initial:QuestionnaireAnswers={
  amount:0,goal:"moderate",horizon:"5to10",dropReaction:"hold",volatility:"some",
  concern:"same",emergency:"3to6",incomeStability:"mostly",liquidity:"unlikely",
  debt:"none",appeal:"mix",approach:"mix",sector:"Open",speculative:"slight",dividendImportance:"slight"
};
type Picked={ticker:string;category:string;amount:number;name:string};
type DemoState={answers:QuestionnaireAnswers; selections:Picked[]; step:"questions"|"allocation"|"build"|"review"; categoryIndex:number};
const questions:{key:keyof QuestionnaireAnswers;title:string;help?:string;options:[string,string][]}[]=[
  {key:"goal",title:"What is your primary investment objective?",options:[["growth","Maximize long-term growth"],["moderate","Moderate growth with less risk"],["income","Generate income and maintain growth potential"],["preserve","Preserve capital"],["unsure","Unsure"]]},
  {key:"horizon",title:"When will you need a significant portion of this money?",options:[["lt2","Less than 2 years"],["2to5","2–5 years"],["5to10","5–10 years"],["gt10","More than 10 years"],["none","No specific timeframe"]]},
  {key:"dropReaction",title:"If a $10,000 investment fell to $8,000, what would you most likely do?",options:[["sellall","Sell most or all"],["sellpart","Sell some"],["hold","Hold and wait"],["buy","Invest more"],["unsure","Unsure"]]},
  {key:"volatility",title:"How much price movement can you tolerate?",help:"Volatility is how much an investment may move up or down in value.",options:[["verylow","Very little"],["some","Some"],["moderatehigh","Moderate to high"],["high","High"],["unsure","Unsure"]]},
  {key:"concern",title:"Which would concern you more?",options:[["loss","Losing $1,000"],["miss","Missing the opportunity to earn $1,000"],["same","Both about the same"],["unsure","Unsure"]]},
  {key:"emergency",title:"How much emergency savings do you have outside this investment?",options:[["gt6","More than 6 months"],["3to6","3–6 months"],["lt3","Less than 3 months"],["none","None"],["unsure","Unsure"]]},
  {key:"incomeStability",title:"How stable is your current income?",options:[["very","Very stable"],["mostly","Mostly stable"],["variable","Variable"],["uncertain","Uncertain"],["none","No regular income"]]},
  {key:"liquidity",title:"How likely are you to need these funds unexpectedly?",options:[["unlikely","Very unlikely"],["possible","Possible"],["likely","Likely"],["verylikely","Very likely"],["unsure","Unsure"]]},
  {key:"debt",title:"Do you have high-interest debt?",options:[["none","No"],["small","A small amount"],["significant","A significant amount"],["unsure","Unsure"]]},
  {key:"appeal",title:"What type of investment appeals to you?",options:[["growth","High-growth companies"],["large","Large established companies"],["dividend","Dividend-paying investments"],["mix","A diversified mix"],["unsure","Unsure"]]},
  {key:"approach",title:"What investment approach would you prefer?",help:"ETFs are funds that can hold many companies in one investment.",options:[["stocks","Mostly individual stocks"],["mix","Stocks and funds"],["funds","Mostly diversified funds"],["unsure","Unsure"]]},
  {key:"sector",title:"Which market sector interests you most?",options:[["Open","Open to all"],["Technology","Technology"],["Healthcare","Healthcare"],["Financials","Financials"],["Consumer","Consumer"],["Energy","Energy"],["Industrials","Industrials"],["Real Estate","Real Estate"],["Unsure","Unsure"]]},
  {key:"speculative",title:"How interested are you in higher-risk investments?",options:[["none","Not interested"],["slight","Slightly"],["moderate","Moderately"],["very","Very interested"],["unsure","Unsure"]]},
  {key:"dividendImportance",title:"How important are dividends?",help:"Dividends are cash distributions that are not guaranteed; paying a dividend does not make an investment risk-free.",options:[["none","Not important"],["slight","Slightly"],["moderate","Moderately"],["very","Very important"],["unsure","Unsure"]]}
];

export default function PublicDemo(){
  const [state,setState]=useState<DemoState>({answers:initial,selections:[],step:"questions",categoryIndex:0});
  const [ready,setReady]=useState(false);
  const [search,setSearch]=useState("");
  const [message,setMessage]=useState("");
  const [openResearch,setOpenResearch]=useState<string|null>(null);
  useEffect(()=>{
    try{
      const saved=localStorage.getItem(KEY);
      if(saved){const parsed=JSON.parse(saved) as Partial<DemoState>;setState(s=>({...s,...parsed,answers:{...initial,...parsed.answers},selections:Array.isArray(parsed.selections)?parsed.selections:[]}));}
    }catch{ /* Ignore invalid or unavailable browser storage. */ }
    setReady(true);
  },[]);
  useEffect(()=>{if(ready){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{ /* Demo remains usable without persistence. */ }}},[state,ready]);
  const setAnswers=(key:keyof QuestionnaireAnswers,value:string|number)=>setState(s=>({...s,answers:{...s.answers,[key]:value}}));
  const profile=useMemo(()=>calculateInvestorProfile(state.answers),[state.answers]);
  const allocation=useMemo(()=>simplifyAllocationForAmount(profile.allocation,state.answers.amount,state.answers.approach),[profile,state.answers.amount,state.answers.approach]);
  const index=Math.min(Math.max(0,state.categoryIndex),Math.max(0,allocation.length-1));
  const current=allocation[index];
  const candidates=useMemo(()=>securityUniverse.filter(x=>x.category===current?.name&& (x.ticker.toLowerCase().includes(search.toLowerCase())||x.name.toLowerCase().includes(search.toLowerCase()))).sort((a,b)=>b.quality-a.quality),[current?.name,search]);
  const money=(n:number)=>n.toLocaleString(undefined,{style:"currency",currency:"USD",maximumFractionDigits:2});
  function continueFromQuestions(e:FormEvent){
    e.preventDefault();
    if(!Number.isFinite(state.answers.amount)||state.answers.amount<=0){setMessage("Enter an amount greater than zero to continue.");return;}
    setMessage("");
    setState(s=>({...s,step:"allocation",categoryIndex:0,selections:[]}));
    window.scrollTo(0,0);
  }
  function move(step:DemoState["step"],categoryIndex=index){
    setMessage("");setSearch("");setOpenResearch(null);setState(s=>({...s,step,categoryIndex}));
    window.scrollTo(0,0);
  }
  function toggle(ticker:string,name:string){
    if(!current)return;
    setState(s=>{
      const exists=s.selections.some(x=>x.ticker===ticker);
      if(exists)return {...s,selections:s.selections.filter(x=>x.ticker!==ticker)};
      const categoryCount=s.selections.filter(x=>x.category===current.name).length;
      const amount=Math.round(current.dollars/(categoryCount+1)*100)/100;
      return {...s,selections:[...s.selections,{ticker,name,category:current.name,amount}]};
    });
  }
  function changeAmount(ticker:string,amount:number){
    setState(s=>({...s,selections:s.selections.map(x=>x.ticker===ticker?{...x,amount:Math.max(0,amount||0)}:x)}));
  }
  const total=state.selections.reduce((sum,s)=>sum+s.amount,0);
  if(!ready)return <section className="panel"><p>Loading your learning workspace…</p></section>;
  return <div>
    <section className="panel" style={{marginBottom:16}}>
      <p className="sectionEyebrow">PortfolioPath · Public learning demo</p>
      <h1>{state.step==="questions"?"Build your investor profile":state.step==="allocation"?"Your educational model allocation":state.step==="build"?"Explore and select example investments":"Your practice portfolio"}</h1>
      <p>No email or password required. Your questionnaire answers and practice selections are kept in this browser, not in a PortfolioPath account. Do not enter sensitive personal details.</p>
      <p className="educationalNotice">Educational simulation only. Risk means investments can rise or fall in value. Models and example rankings are not personalized investment advice.</p>
      <div className="actions">
        <button className="btn btnSecondary" type="button" onClick={()=>move("questions")}>Questionnaire</button>
        {state.answers.amount>0&&<button className="btn btnSecondary" type="button" onClick={()=>move("allocation")}>Allocation</button>}
        {state.answers.amount>0&&<button className="btn btnSecondary" type="button" onClick={()=>move("build")}>Build</button>}
        {state.answers.amount>0&&<button className="btn btnSecondary" type="button" onClick={()=>move("review")}>Review</button>}
        <Link className="btn btnSecondary" href="/learn">Learning Center</Link>
      </div>
    </section>
    {state.step==="questions"&&<form onSubmit={continueFromQuestions}>
      <div className="card" style={{marginBottom:12}}>
        <label className="field"><strong>1. How much are you planning to invest?</strong>
          <input type="number" min="0.01" step="any" required value={state.answers.amount||""} onChange={e=>setAnswers("amount",Number(e.target.value))} placeholder="Example: 5000"/>
        </label>
      </div>
      {questions.map((q,i)=><div className="card" key={q.key} style={{marginBottom:12}}>
        <label className="field"><strong>{i+2}. {q.title}</strong>
          {q.help&&<span className="muted">{q.help}</span>}
          <select value={String(state.answers[q.key])} onChange={e=>setAnswers(q.key,e.target.value)}>
            {q.options.map(([value,label])=><option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>)}
      {profile.debtNotice==="strong"&&<p>Consider reviewing high-interest debt before investing.</p>}
      {message&&<p role="alert">{message}</p>}
      <button className="btn btnPrimary" type="submit">View My Educational Allocation</button>
    </form>}
    {state.step==="allocation"&&<>
      <section className="metricStrip">
        <div className="metricItem"><small>Learning profile</small><strong>{profile.profileName}</strong></div>
        <div className="metricItem"><small>Risk tolerance</small><strong>{profile.riskTolerance}/100</strong></div>
        <div className="metricItem"><small>Risk capacity</small><strong>{profile.riskCapacity}/100</strong></div>
      </section>
      <section className="panel" style={{marginTop:16}}>
        <h2>Example using {money(state.answers.amount)}</h2>
        <p className="muted">Based on your answers, the educational model includes the following weights. {portfolioComplexityPlan(state.answers.amount).label}.</p>
        <div className="allocationTable">
          <div className="allocationRow allocationHead"><div>Category</div><div>Weight</div><div>Example amount</div></div>
          {allocation.map(a=><div className="allocationRow" key={a.name}><div><strong>{a.name}</strong><div className="allocationBar"><span style={{width:`${a.pct}%`}} /></div></div><div>{a.pct.toFixed(1)}%</div><div>{money(a.dollars)}</div></div>)}
        </div>
        <div className="actions"><button className="btn btnPrimary" onClick={()=>move("build",0)}>Explore Investment Examples</button></div>
      </section>
    </>}
    {state.step==="build"&&current&&<>
      <section className="panel">
        <p className="sectionEyebrow">Category {index+1} of {allocation.length}</p>
        <h2>{current.name}</h2>
        <p>Model weight: <strong>{current.pct.toFixed(1)}%</strong> · Example budget: <strong>{money(current.dollars)}</strong></p>
        <p className="muted">Explore these illustrative stocks and ETFs. Higher placement reflects an educational quality metric, not a prediction or instruction to buy.</p>
        <label className="field">Search investment examples<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search ticker or name"/></label>
        <div className="grid">
          {candidates.map(s=>{
            const selected=state.selections.find(x=>x.ticker===s.ticker);
            return <div className="card" key={s.ticker}>
              <CandidateResearch
                investment={{ticker:s.ticker,name:s.name,type:s.type as "Stock"|"ETF",category:s.category}}
                open={openResearch===s.ticker}
                onToggle={()=>setOpenResearch(previous=>previous===s.ticker?null:s.ticker)}
              />
              <p className="muted">{s.type} · Quality score {s.quality}/100 · Risk indicator {s.risk}/100</p>
              <button className={selected?"btn btnSecondary":"btn btnPrimary"} type="button" onClick={()=>toggle(s.ticker,s.name)}>{selected?"Remove example":"Add to practice portfolio"}</button>
              {selected&&<label className="field">Planned amount ($)<input type="number" min="0" step="0.01" value={selected.amount} onChange={e=>changeAmount(s.ticker,Number(e.target.value))}/></label>}
            </div>;
          })}
          {candidates.length===0&&<p>No examples match this search.</p>}
        </div>
        <p>Selected in this category: {money(state.selections.filter(s=>s.category===current.name).reduce((sum,s)=>sum+s.amount,0))} of {money(current.dollars)} illustrative budget.</p>
        <div className="actions">
          {index>0&&<button className="btn btnSecondary" onClick={()=>move("build",index-1)}>Previous Category</button>}
          {index<allocation.length-1?<button className="btn btnPrimary" onClick={()=>move("build",index+1)}>Continue to Next Category</button>:<button className="btn btnPrimary" onClick={()=>move("review")}>Review Practice Portfolio</button>}
        </div>
      </section>
    </>}
    {state.step==="review"&&<PortfolioAnalysisDashboard
      selections={state.selections}
      allocation={allocation}
      budget={state.answers.amount}
      profileName={profile.profileName}
      onEdit={()=>move("build",0)}
      onReset={()=>{
        if(window.confirm("Clear your local practice portfolio and start again?")){
          try{localStorage.removeItem(KEY);localStorage.removeItem("portfoliopath-review-reflection-v1");}catch{}
          setState({answers:initial,selections:[],step:"questions",categoryIndex:0});
          window.scrollTo(0,0);
        }
      }}
    />}
  </div>;
}
