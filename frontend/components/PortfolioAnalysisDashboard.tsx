"use client";

import { useEffect, useMemo, useState } from "react";
import { securityUniverse } from "@/lib/securityUniverse";

export type PracticeSelection = { ticker:string; name:string; category:string; amount:number };
export type ModelCategory = { name:string; pct:number; dollars:number };

type Props={
  selections:PracticeSelection[];
  allocation:ModelCategory[];
  budget:number;
  profileName:string;
  onEdit:()=>void;
  onReset:()=>void;
};

const money=(value:number)=>value.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2});
const percent=(value:number)=>`${value.toFixed(1)}%`;
const palette=["#2f6f5e","#759d88","#476789","#9bb2c5","#d1a46e","#9a87ab","#7f9eaa","#a4a88a","#cc9b8e","#6e8493"];
const safeAmount=(n:number)=>Number.isFinite(n)?Math.max(0,n):0;

export default function PortfolioAnalysisDashboard({selections,allocation,budget,profileName,onEdit,onReset}:Props){
  const [reflection,setReflection]=useState("");
  const [savedMessage,setSavedMessage]=useState("");
  useEffect(()=>{
    try{setReflection(localStorage.getItem("portfoliopath-review-reflection-v1")||"");}catch{}
  },[]);
  const model=useMemo(()=>allocation.filter(a=>Number(a.pct)>0),[allocation]);
  const planned=safeAmount(budget);
  const rows=useMemo(()=>selections.map(s=>({...s,amount:safeAmount(Number(s.amount))})).filter(s=>s.amount>0).sort((a,b)=>b.amount-a.amount),[selections]);
  const total=rows.reduce((sum,s)=>sum+s.amount,0);
  const difference=planned-total;
  const usedPct=planned>0?total/planned*100:0;
  const groups=useMemo(()=>{
    const map=new Map<string,number>();
    rows.forEach(s=>map.set(s.category,(map.get(s.category)||0)+s.amount));
    return model.map(m=>({
      ...m,
      amount:map.get(m.name)||0,
      actualPct:total>0?(map.get(m.name)||0)/total*100:0,
      budgetPct:planned>0?(map.get(m.name)||0)/planned*100:0,
      diff:(map.get(m.name)||0)-safeAmount(m.dollars)
    })).concat([...map].filter(([name])=>!model.some(m=>m.name===name)).map(([name,amount])=>({
      name,pct:0,dollars:0,amount,actualPct:total>0?amount/total*100:0,budgetPct:planned>0?amount/planned*100:0,diff:amount
    }))).sort((a,b)=>b.amount-a.amount||b.pct-a.pct);
  },[rows,model,total,planned]);
  const investedGroups=groups.filter(g=>g.amount>0);
  const largest=rows[0];
  const largestWeight=largest&&total>0?largest.amount/total*100:0;
  const etfCount=rows.filter(x=>securityUniverse.find(s=>s.ticker===x.ticker)?.type==="ETF").length;
  const stockCount=rows.length-etfCount;
  const possibleOverlaps=useMemo(()=>{
    const flags:string[]=[];
    const byCategory=new Map<string,typeof rows>();
    rows.forEach(row=>byCategory.set(row.category,[...(byCategory.get(row.category)||[]),row]));
    for(const [cat,holdings] of byCategory){
      const funds=holdings.filter(x=>securityUniverse.find(s=>s.ticker===x.ticker)?.type==="ETF");
      if(funds.length>1) flags.push(`${cat}: ${funds.map(x=>x.ticker).join(" and ")} may hold some of the same securities. Compare their official holdings.`);
    }
    const broad=rows.filter(x=>x.category==="Broad U.S. Market" && securityUniverse.find(s=>s.ticker===x.ticker)?.type==="ETF");
    const otherUs=rows.filter(x=>x.category!=="Broad U.S. Market" && !["International","Bonds","Short-Term","Short-Term / Cash"].includes(x.category));
    if(broad.length&&otherUs.length) flags.push("Broad U.S. market funds may already contain some of your individual U.S. stocks or sector-fund holdings. Compare underlying holdings before assuming they add distinct exposure.");
    return flags;
  },[rows]);
  const insights=useMemo(()=>{
    const notes:{heading:string;body:string;kind:"notice"|"consider"|"good"}[]=[];
    if(!rows.length){
      notes.push({heading:"Start with your first selection",body:"Your practice portfolio is empty. Return to the builder and choose at least one educational investment example.",kind:"notice"});
      return notes;
    }
    if(total>planned+0.01 && planned>0) notes.push({heading:"Above your practice budget",body:`Your selections total ${money(total-planned)} more than the ${money(planned)} amount entered. Review your planned amounts before treating the allocation as complete.`,kind:"consider"});
    else if(difference>0.01) notes.push({heading:"Some budget is unallocated",body:`${money(difference)} of your original practice budget has not been assigned to a holding. This isn't necessarily wrong, but consider whether it is intentional.`,kind:"notice"});
    else notes.push({heading:"Budget allocated",body:"Your selected dollar amounts cover the original practice budget, within rounding.",kind:"good"});
    if(largestWeight>=25) notes.push({heading:"Single-holding concentration",body:`${largest?.ticker} represents ${percent(largestWeight)} of the amount selected. Consider how a sizable movement in that one investment could affect your overall portfolio. An ETF itself may be diversified internally.`,kind:"consider"});
    else notes.push({heading:"Individual position sizes",body:"No single selected ticker is 25% or more of the total currently allocated. That does not eliminate common market or sector risks.",kind:"good"});
    const categoryHeavy=investedGroups.filter(g=>g.actualPct>=40);
    if(categoryHeavy.length) notes.push({heading:"Category exposure",body:`${categoryHeavy.map(g=>`${g.name} (${percent(g.actualPct)})`).join(", ")} accounts for a large share of currently selected dollars. Consider whether those exposures are consistent with the original model.`,kind:"notice"});
    if(possibleOverlaps.length) notes.push({heading:"Possible holdings overlap",body:"Some selections could own the same underlying companies. The notes below highlight pairs worth checking; overlap has not been measured from live holdings data.",kind:"consider"});
    if(rows.length>1&&!possibleOverlaps.length) notes.push({heading:"Diversification requires looking inside investments",body:"Different tickers do not automatically mean different underlying exposures. Review holdings, business drivers, industries and regions before drawing conclusions.",kind:"notice"});
    return notes;
  },[rows,total,planned,difference,largest,largestWeight,investedGroups,possibleOverlaps]);
  function saveReflection(){
    try{
      localStorage.setItem("portfoliopath-review-reflection-v1",reflection);
      setSavedMessage("Saved in this browser.");
    }catch{setSavedMessage("Browser storage is unavailable, so this note could not be saved.");}
  }
  function exportSummary(){
    const quote=(value:string|number)=>`"${String(value).replace(/"/g,'""')}"`;
    const csv=[
      ["PortfolioPath educational practice portfolio"],
      ["Learning profile",profileName],["Practice budget",planned],["Selected total",total],
      [],["Ticker","Investment","Category","Planned amount","Percent of selected total"],
      ...rows.map(r=>[r.ticker,r.name,r.category,r.amount,total>0?(100*r.amount/total).toFixed(2):"0"]),
      [],["Category","Original model percent","Selected dollars","Selected percent of total"],
      ...groups.map(g=>[g.name,g.pct,g.amount,g.actualPct.toFixed(2)]),
      [],["Note","Educational simulation, not investment advice. No live prices or verified ETF overlap are included."]
    ].map(row=>row.map(quote).join(",")).join("\r\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement("a");anchor.href=url;anchor.download="PortfolioPath_Practice_Analysis.csv";
    document.body.appendChild(anchor);anchor.click();anchor.remove();URL.revokeObjectURL(url);
  }

  return <div className="analysisDashboard">
    <section className="analysisHero">
      <p className="sectionEyebrow">PortfolioPath / Your final review</p>
      <h2>Understand the portfolio you built.</h2>
      <p>Compare your practice selections with the educational allocation from your questionnaire, explore concentration and overlap questions, and reflect on what you learned.</p>
      <div className="analysisHeroMeta"><span>Learning profile: <strong>{profileName}</strong></span><span>{rows.length} planned holdings</span><span>Educational simulation only</span></div>
    </section>
    <section className="analysisKpis" aria-label="Portfolio summary">
      <div className="analysisKpi"><span>Practice investment budget</span><strong>{money(planned)}</strong><small>From your questionnaire</small></div>
      <div className="analysisKpi"><span>Assigned to holdings</span><strong>{money(total)}</strong><small>{planned>0?percent(usedPct)+" of budget":"No budget entered"}</small></div>
      <div className="analysisKpi"><span>{difference>=0?"Not yet allocated":"Over budget"}</span><strong>{money(Math.abs(difference))}</strong><small>{difference>=0?"Difference remaining":"Adjust selected amounts"}</small></div>
      <div className="analysisKpi"><span>Investment examples selected</span><strong>{rows.length}</strong><small>{stockCount} stocks · {etfCount} ETFs</small></div>
    </section>
    <div className="analysisTwoColumn">
      <section className="analysisSection">
        <p className="sectionEyebrow">Portfolio composition</p><h3>Where your selected dollars went</h3>
        <p className="muted">Percentages in this section use the amount you've assigned to investments, not the full budget.</p>
        <div className="analysisSegmentBar" role="img" aria-label={investedGroups.length?"Selected category mix: "+investedGroups.map(g=>g.name+" "+percent(g.actualPct)).join(", "):"No selected holdings"}>
          {investedGroups.map((g,i)=><span key={g.name} style={{width:`${g.actualPct}%`,background:palette[i%palette.length]}} title={g.name+" "+percent(g.actualPct)} />)}
        </div>
        {investedGroups.length?investedGroups.map((g,i)=><div className="analysisLegend" key={g.name}>
          <span className="analysisLegendDot" style={{background:palette[i%palette.length]}}/><span>{g.name}</span><strong>{percent(g.actualPct)}</strong><span className="analysisLegendMoney">{money(g.amount)}</span>
        </div>):<p className="muted">Add holdings in the builder to see your category mix.</p>}
      </section>
      <section className="analysisSection">
        <p className="sectionEyebrow">Research perspective</p><h3>Understanding concentration</h3>
        <div className="analysisMiniStat"><span>Largest position</span><strong>{largest?largest.ticker:"—"}</strong><small>{largest?percent(largestWeight)+" of selected dollars":"No holdings yet"}</small></div>
        <div className="analysisMiniStat"><span>Categories represented</span><strong>{investedGroups.length} of {model.length}</strong><small>Based on your model categories</small></div>
        <p className="analysisQuietNote">These measures describe your practice selection sizes only. They are not validated risk scores or measures of diversification inside ETFs.</p>
      </section>
    </div>
    <section className="analysisSection">
      <p className="sectionEyebrow">Allocation comparison</p><h3>Original model vs. your selections</h3>
      <p className="muted">Compare each category's original model budget with the amount you assigned. The selected percentage of the *original budget* is shown alongside its model weight.</p>
      <div className="analysisTableScroll"><table className="analysisTable"><thead><tr><th scope="col">Category</th><th scope="col">Model weight</th><th scope="col">Selected / budget</th><th scope="col">Difference ($)</th></tr></thead><tbody>
        {groups.map(g=><tr key={g.name}>
          <td><strong>{g.name}</strong><div className="analysisDualBars" aria-label={`Model ${percent(g.pct)}, selected ${percent(g.budgetPct)} of budget`}><span style={{width:`${Math.min(100,g.pct)}%`}}/><span style={{width:`${Math.min(100,g.budgetPct)}%`}}/></div></td>
          <td>{percent(g.pct)}</td><td>{money(g.amount)}<small>{percent(g.budgetPct)} of original budget</small></td>
          <td className={Math.abs(g.diff)>0.01?"analysisDelta":""}>{Math.abs(g.diff)<0.01?"—":(g.diff>0?"+":"−")+money(Math.abs(g.diff))}</td>
        </tr>)}
      </tbody></table></div>
      <p className="analysisQuietNote">Top bar = questionnaire model; bottom bar = your planned allocation. A difference is a prompt to reflect, not an instruction to buy or sell.</p>
    </section>
    <section className="analysisSection">
      <p className="sectionEyebrow">Your positions</p><h3>Selected holdings</h3>
      {rows.length?<div className="analysisTableScroll"><table className="analysisTable"><thead><tr><th scope="col">Investment</th><th scope="col">Category</th><th scope="col">Planned amount</th><th scope="col">Share of selections</th></tr></thead><tbody>
        {rows.map(r=><tr key={r.ticker}><td><strong>{r.ticker}</strong><small>{r.name}</small></td><td>{r.category}</td><td>{money(r.amount)}</td><td>{percent(total?100*r.amount/total:0)}</td></tr>)}
      </tbody></table></div>:<p className="muted">Your selections will appear here once you add an investment in the builder.</p>}
    </section>
    <section className="analysisSection">
      <p className="sectionEyebrow">Educational observations</p><h3>What your choices can teach you</h3>
      <div className="analysisInsightGrid">{insights.map(x=><article className="analysisInsight" key={x.heading}><span className={`analysisInsightMarker ${x.kind}`}/><div><h4>{x.heading}</h4><p>{x.body}</p></div></article>)}</div>
      {possibleOverlaps.length>0&&<div className="analysisOverlap"><h4>Overlap questions to research</h4><ul>{possibleOverlaps.map(x=><li key={x}>{x}</li>)}</ul><p>These are category-based prompts, not confirmed duplication percentages. Fund holdings change over time.</p></div>}
    </section>
    <section className="analysisSection">
      <p className="sectionEyebrow">Learning checkpoint</p><h3>What did you learn?</h3>
      <p>Try explaining why you chose one investment, what could make it rise or fall, and one question you would investigate before investing real money.</p>
      <label className="field" htmlFor="analysis-reflection">Your personal reflection
        <textarea id="analysis-reflection" rows={4} value={reflection} onChange={e=>{setReflection(e.target.value);setSavedMessage("");}} placeholder="I chose this investment because… One risk I would research is…"/>
      </label>
      <div className="actions"><button type="button" className="btn btnSecondary" onClick={saveReflection}>Save Reflection in Browser</button>{savedMessage&&<span role="status" className="muted">{savedMessage}</span>}</div>
    </section>
    <div className="analysisActions">
      <button type="button" className="btn btnPrimary" onClick={onEdit}>Edit My Practice Portfolio</button>
      <button type="button" className="btn btnSecondary" onClick={exportSummary} disabled={!rows.length}>Download Analysis CSV</button>
      <button type="button" className="btn btnSecondary" onClick={onReset}>Start a New Practice Portfolio</button>
    </div>
    <p className="analysisDisclaimer">PortfolioPath provides educational simulations only. Dollar amounts are planned inputs, not actual market values. This dashboard does not use live prices, prove ETF holdings overlap, or provide individualized investment advice. Practice data remains in this browser.</p>
  </div>;
}
