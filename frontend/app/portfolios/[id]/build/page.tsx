"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { securityUniverse } from "@/lib/securityUniverse";
import { guidanceFor } from "@/lib/researchGuidance";
import { allocationExplanation } from "@/lib/allocationExplanations";
import CategoryCompletionReview from "@/components/CategoryCompletionReview";
import { suggestedHoldingCount, equalWeightSuggestion, positionSizingExplanation } from "@/lib/positionSizing";
import InvestmentResearchResources from "@/components/InvestmentResearchResources";

type Allocation={name:string;pct:number;dollars:number};
type Selection={ticker:string;name:string;category:string;amount:number;type:string};

function fitScore(s:any,rp:any){
  const profile=String(rp?.profileName ?? "Balanced");
  const weights=({
    "Protect":{quality:.30,stability:.30,growth:.05,dividend:.15,risk:.20},
    "Cautious":{quality:.28,stability:.25,growth:.08,dividend:.14,risk:.25},
    "Balanced":{quality:.25,stability:.18,growth:.20,dividend:.08,risk:.29},
    "Growth":{quality:.22,stability:.10,growth:.32,dividend:.04,risk:.32},
    "Aggressive Growth":{quality:.18,stability:.06,growth:.38,dividend:.03,risk:.35},
  } as Record<string,{quality:number;stability:number;growth:number;dividend:number;risk:number}>)[profile] ?? {quality:.25,stability:.18,growth:.20,dividend:.08,risk:.29};
  const targetRisk=Number(rp?.overallRisk ?? 55);
  const riskFit=Math.max(0,100-Math.abs(Number(s.risk)-targetRisk)*1.6);
  const score=s.quality*weights.quality+s.stability*weights.stability+s.growth*weights.growth+s.dividend*weights.dividend+riskFit*weights.risk;
  const approach=rp?.answers?.approach;
  let adj=0;
  if(approach==="funds"&&s.type==="ETF")adj+=6;
  if(approach==="stocks"&&s.type==="Stock")adj+=5;
  return Math.max(1,Math.min(99,Math.round(score+adj)));
}

export default function PortfolioBuilder(){
  const params=useParams<{id:string}>();
  const router=useRouter();
  const search=useSearchParams();
  const [portfolio,setPortfolio]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [searchText,setSearchText]=useState("");
  const [typeFilter,setTypeFilter]=useState<"All"|"Stock"|"ETF">("All");
  const [selections,setSelections]=useState<Record<string,Selection>>({});
  const [message,setMessage]=useState("");
  const [expanded,setExpanded]=useState(false);
  const [showCompletion,setShowCompletion]=useState(false);
  const [browseMode,setBrowseMode]=useState<"Best fit"|"Beginner-friendly ETFs"|"Lower risk first"|"Higher quality first"|"Growth-focused"|"Dividend-focused">("Best fit");
  const [amountDrafts,setAmountDrafts]=useState<Record<string,string>>({});

  useEffect(()=>{(async()=>{
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){router.push("/login");return}
    const {data:p}=await supabase.from("portfolios").select("*").eq("id",params.id).eq("user_id",user.id).single();
    setPortfolio(p);
    const {data:existing}=await supabase.from("portfolio_selections").select("*").eq("portfolio_id",params.id).eq("user_id",user.id);
    const map:Record<string,Selection>={};
    (existing??[]).forEach((x:any)=>map[x.symbol]={ticker:x.symbol,name:x.name,category:x.category,amount:Number(x.planned_amount),type:x.security_type});
    setSelections(map);
    setLoading(false);
  })()},[params.id,router]);

  const allocation:Allocation[]=useMemo(
    ()=>[...(portfolio?.risk_profile?.allocation ?? [])].sort((a:any,b:any)=>Number(b.pct)-Number(a.pct)),
    [portfolio]
  );
  const idx=Math.max(0,Math.min(Math.max(0,allocation.length-1),Number(search.get("step")??0)));
  const current=allocation[idx];
  const guidance=guidanceFor(current?.name);
  const plannedInvestment=Number(portfolio?.risk_profile?.plannedInvestment ?? portfolio?.risk_profile?.answers?.amount ?? 0);
  const percentageOnly=Boolean(portfolio?.risk_profile?.percentageOnly) || !plannedInvestment;
  const categoryTargetDollars=plannedInvestment>0
    ? plannedInvestment*(Number(current?.pct??0)/100)
    : (Number(current?.dollars??0)>0 ? Number(current.dollars) : 10000*(Number(current?.pct??0)/100));
  const holdingGuide=suggestedHoldingCount(plannedInvestment || undefined,Number(current?.pct??0),portfolio?.risk_profile?.answers?.approach);
  const holdingGuideText=positionSizingExplanation(plannedInvestment || undefined,Number(current?.pct??0),holdingGuide,portfolio?.risk_profile?.answers?.approach);
  const allocationWhy=allocationExplanation(current?.name??"",Number(current?.pct??0),portfolio?.risk_profile);

  const options=useMemo(()=>{
    if(!current)return [];
    let rows=securityUniverse
      .filter(s=>s.category===current.name)
      .filter(s=>typeFilter==="All"||s.type===typeFilter)
      .filter(s=>`${s.ticker} ${s.name}`.toLowerCase().includes(searchText.toLowerCase()))
      .map(s=>({...s,match:fitScore(s,portfolio?.risk_profile)}));
    if(browseMode==="Beginner-friendly ETFs")rows=rows.filter(s=>s.type==="ETF");
    const sorters:Record<string,(a:any,b:any)=>number>={
      "Best fit":(a,b)=>b.match-a.match,
      "Beginner-friendly ETFs":(a,b)=>b.match-a.match,
      "Lower risk first":(a,b)=>a.risk-b.risk||b.match-a.match,
      "Higher quality first":(a,b)=>b.quality-a.quality||b.match-a.match,
      "Growth-focused":(a,b)=>b.growth-a.growth||b.match-a.match,
      "Dividend-focused":(a,b)=>b.dividend-a.dividend||b.match-a.match,
    };
    return rows.sort(sorters[browseMode]);
  },[current,typeFilter,searchText,portfolio,browseMode]);

  const visibleOptions=expanded || searchText || typeFilter!=="All" || browseMode!=="Best fit" ? options : options.slice(0,12);

  if(loading)return <section className="panel">Loading portfolio builder…</section>;
  if(!portfolio)return <section className="panel">Portfolio not found.</section>;
  if(!current)return <section className="panel"><h1>No allocation found</h1><Link className="btn btnPrimary" href={`/portfolios/${params.id}/questionnaire`}>Complete Questionnaire</Link></section>;

  const categorySelected=Object.values(selections).filter(s=>s.category===current.name).reduce((sum,s)=>sum+s.amount,0);
  const remaining=categoryTargetDollars-categorySelected;

  async function saveAmount(s:any,amount:number){
    const clean=Math.max(0,Number(amount)||0);
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return;
    if(clean===0){
      await supabase.from("portfolio_selections").delete().eq("portfolio_id",params.id).eq("user_id",user.id).eq("symbol",s.ticker);
      setSelections(prev=>{const n={...prev};delete n[s.ticker];return n});
      return;
    }
    const row={portfolio_id:params.id,user_id:user.id,symbol:s.ticker,name:s.name,category:s.category,security_type:s.type,planned_amount:clean};
    const {error}=await supabase.from("portfolio_selections").upsert(row,{onConflict:"portfolio_id,symbol"});
    if(error){setMessage(error.message);return}
    setSelections(prev=>({...prev,[s.ticker]:{ticker:s.ticker,name:s.name,category:s.category,amount:clean,type:s.type}}));
  }

  function goStep(next:number){
    setSearchText(""); setTypeFilter("All"); setBrowseMode("Best fit"); setExpanded(false); setShowCompletion(false);
    router.push(`/portfolios/${params.id}/build?step=${next}`);
  }


  const totalSelected=Object.values(selections).reduce((s,x)=>s+x.amount,0);
  const target=Number(portfolio.risk_profile?.answers?.amount??0);

  return (
    <>
      <section className="panel">
        <p className="muted">Guided Portfolio Builder • Step {idx+1} of {allocation.length}</p>
        <h1>{current.name}</h1>
        <p>
          <strong>{Number(current.pct).toFixed(1)}%</strong> target
          {!percentageOnly && <> • <strong>${categoryTargetDollars.toLocaleString(undefined,{maximumFractionDigits:0})}</strong></>}
        </p>
        <p>{guidance.role}</p>
        <div className="progress" aria-label={`Builder progress: ${idx+1} of ${allocation.length}`}>
          <span style={{width:`${((idx+1)/allocation.length)*100}%`}}/>
        </div>
        <div className="grid" style={{marginTop:16}}>
          <div className="card">
            <span className="muted">Selected here</span>
            <div className="kpi">{percentageOnly
              ? `${categoryTargetDollars>0 ? ((categorySelected/categoryTargetDollars)*Number(current.pct)).toFixed(1) : "0.0"}%`
              : `$${categorySelected.toLocaleString(undefined,{maximumFractionDigits:0})}`}</div>
          </div>
          <div className="card">
            <span className="muted">Remaining here</span>
            <div className="kpi">{percentageOnly
              ? `${Math.max(0,Number(current.pct) - (categoryTargetDollars>0 ? (categorySelected/categoryTargetDollars)*Number(current.pct) : 0)).toFixed(1)}%`
              : `$${Math.max(0,remaining).toLocaleString(undefined,{maximumFractionDigits:0})}`}</div>
          </div>
          <div className="card"><span className="muted">Suggested holdings</span><div className="kpi">{holdingGuide.min}{holdingGuide.max!==holdingGuide.min?`–${holdingGuide.max}`:""}</div></div>
          <div className="card"><span className="muted">Research options</span><div className="kpi">{securityUniverse.filter(s=>s.category===current.name).length}</div></div>
        </div>
      </section>

      <section className="panel" style={{marginTop:16}}>
        <p className="muted">How many investments should I choose here?</p>
        <h2>Suggested: {holdingGuide.min}{holdingGuide.max!==holdingGuide.min?`–${holdingGuide.max}`:""} holding{holdingGuide.max>1?"s":""}</h2>
        <p>{holdingGuideText}</p>
        {!percentageOnly && <p className="helpText">If you used equal weights, that would be about <strong>${equalWeightSuggestion(categoryTargetDollars,holdingGuide.max).toLocaleString(undefined,{maximumFractionDigits:0})}</strong> per holding when using {holdingGuide.max} holdings. You can choose unequal weights if your research supports it.</p>}
        {percentageOnly && <p className="helpText">You can split the {Number(current.pct).toFixed(1)}% category across multiple holdings. For example, with {holdingGuide.max} equal-weight holdings, each would be about {(Number(current.pct)/holdingGuide.max).toFixed(1)}% of the total portfolio.</p>}
      </section>

      <section className="panel" style={{marginTop:16}}>
        <p className="muted">Why this category has this weight</p>
        <h2>{allocationWhy.headline}</h2>
        <ul>{allocationWhy.reasons.map(r=><li key={r}>{r}</li>)}</ul>
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>What should I understand before choosing?</h2>
        <p className="muted">These questions explain what matters in this category. The ranked list below narrows where to start; it does not make the decision for you.</p>
        <ul>{guidance.questions.map(q=><li key={q}>{q}</li>)}</ul>
      </section>

      <section className="panel" style={{marginTop:16}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:16,flexWrap:"wrap",alignItems:"end"}}>
          <div>
            <h2 style={{marginBottom:4}}>Research library</h2>
            <p className="muted" style={{marginTop:0}}>Twelve starting options appear automatically. If you do not know a ticker to search, use the “Show me” menu to browse by a simple characteristic, or open the full list.</p>
            <p className="helpText">PortfolioPath research metrics are refreshed on a monthly cadence and may be up to 30 days old. They are not real-time market data.</p>
          </div>
          <span className="statusBadge statusInfo">{options.length} matching options</span>
        </div>
        <div className="grid">
          <label className="field">Search
            <input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Company, fund, or ticker"/>
          </label>
          <label className="field">Investment type
            <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value as any)}>
              <option>All</option><option>Stock</option><option>ETF</option>
            </select>
          </label>
          <label className="field">Not sure what to search? Show me
            <select value={browseMode} onChange={e=>setBrowseMode(e.target.value as any)}>
              <option>Best fit</option>
              <option>Beginner-friendly ETFs</option>
              <option>Lower risk first</option>
              <option>Higher quality first</option>
              <option>Growth-focused</option>
              <option>Dividend-focused</option>
            </select>
          </label>
        </div>
      </section>

      <section style={{marginTop:16,display:"grid",gap:12}}>
        {visibleOptions.map((s:any,i:number)=>{
          const selected=selections[s.ticker]?.amount??0;
          const rank=options.findIndex((x:any)=>x.ticker===s.ticker)+1;
          return <article className="card cardInteractive" key={s.ticker}>
            <div style={{display:"flex",justifyContent:"space-between",gap:14,alignItems:"flex-start",flexWrap:"wrap"}}>
              <div style={{maxWidth:720}}>
                <span className="statusBadge statusInfo">#{rank} in {current.name}</span>
                <h3 style={{fontSize:21,margin:"10px 0 4px"}}>{s.ticker} — {s.name}</h3>
                <p className="muted">{s.type} • {s.category}</p>
                <p><strong>Why it appears:</strong> Its quality, growth, stability, risk characteristics, and portfolio role rank relatively well for this category and your profile.</p>
                <p className="helpText">Fit is a research-ranking tool, not an expected-return forecast.</p>
              </div>
              <div style={{textAlign:"right"}}>
                <div className="kpi">{Number(s.match).toFixed(0)}</div>
                <div className="muted" style={{fontSize:12}}>Category Fit / 100</div>
              </div>
            </div>

            <div className="grid">
              <div className="card"><span className="muted">Risk</span><div className="kpi" style={{fontSize:20}}>{Math.round(s.risk/10)}/10</div></div>
              <div className="card"><span className="muted">Quality</span><div className="kpi" style={{fontSize:20}}>{s.quality}/100</div></div>
              <div className="card"><span className="muted">Growth</span><div className="kpi" style={{fontSize:20}}>{s.growth}/100</div></div>
              <div className="card"><span className="muted">Stability</span><div className="kpi" style={{fontSize:20}}>{s.stability}/100</div></div>
            </div>

            <div className="actions">
              <Link className="btn btnSecondary" href={`/research/${s.ticker}?portfolio=${params.id}&category=${encodeURIComponent(current.name)}`}>Full Guided Research</Link>
              <label className="field" style={{margin:0,minWidth:210}}>
                {percentageOnly ? "Portfolio weight (%)" : "Planned amount ($)"}
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  placeholder={percentageOnly ? "Enter weight" : "Enter amount"}
                  value={amountDrafts[s.ticker] ?? (selected>0 ? (percentageOnly && plannedInvestment<=0 ? ((selected/10000)*100).toFixed(2).replace(/\.00$/,"") : String(selected)) : "")}
                  onChange={e=>setAmountDrafts(prev=>({...prev,[s.ticker]:e.target.value}))}
                  onBlur={async e=>{
                    const raw=e.target.value.trim();
                    if(raw===""){await saveAmount(s,0);setAmountDrafts(prev=>({...prev,[s.ticker]:""}));return;}
                    const entered=Number(raw);
                    if(!Number.isFinite(entered)||entered<0){setMessage("Enter a valid number of zero or greater.");return;}
                    await saveAmount(s,percentageOnly && plannedInvestment<=0 ? (entered/100)*10000 : entered);
                  }}
                  onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();e.currentTarget.blur();}}}
                />
              </label>
            </div>
            <div style={{marginTop:12}}>
              <InvestmentResearchResources ticker={s.ticker} name={s.name} type={s.type}/>
            </div>
          </article>
        })}
        {!visibleOptions.length && <section className="panel"><p>No investments match the current search/filter.</p></section>}
      </section>

      {options.length>12 && !searchText && typeFilter==="All" && browseMode==="Best fit" &&
        <div className="actions" style={{justifyContent:"center",marginTop:14}}>
          <button className="btn btnSecondary" onClick={()=>setExpanded(v=>!v)}>{expanded?"Show top options only":`Browse all ${options.length} options`}</button>
        </div>
      }


      <section className="panel" style={{marginTop:16}}>
        <p><strong>Total portfolio selected:</strong> {percentageOnly
          ? `${(totalSelected/10000*100).toFixed(1)}%`
          : `$${totalSelected.toLocaleString(undefined,{maximumFractionDigits:0})} of $${plannedInvestment.toLocaleString(undefined,{maximumFractionDigits:0})}`}</p>
        {categorySelected>categoryTargetDollars*1.1 && <p className="statusBadge statusImportant">This category is more than 10% above its model allocation.</p>}
        {Object.values(selections).filter(s=>s.category===current.name).length < holdingGuide.min && <p className="statusBadge statusInfo">
          You currently have {Object.values(selections).filter(s=>s.category===current.name).length} holding(s) here. PortfolioPath suggests about {holdingGuide.min}{holdingGuide.max!==holdingGuide.min?`–${holdingGuide.max}`:""} for this category.
        </p>}
        <div className="actions">
          {idx>0 && <button className="btn btnSecondary" onClick={()=>goStep(idx-1)}>Previous Category</button>}
          {idx<allocation.length-1
            ? <button className="btn btnPrimary" onClick={()=>setShowCompletion(true)}>Review category before continuing</button>
            : <Link className="btn btnPrimary" href={`/portfolios/${params.id}/summary`}>Finish Portfolio</Link>}
        </div>
        {message&&<p>{message}</p>}
      </section>

      {showCompletion && idx<allocation.length-1 && <CategoryCompletionReview
        category={current.name}
        target={categoryTargetDollars}
        selected={categorySelected}
        holdings={Object.values(selections).filter(s=>s.category===current.name).map(s=>({ticker:s.ticker,amount:s.amount}))}
        nextCategory={allocation[idx+1]?.name}
        onContinue={()=>goStep(idx+1)}
        portfolioId={params.id}
        checkpointCount={Object.values(selections).filter(s=>s.category===current.name).length}
      />}
    </>
  );
}
