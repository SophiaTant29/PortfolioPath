"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResearchCheckpoint({
  portfolioId,category,symbol,onSaved
}:{portfolioId:string;category:string;symbol:string;onSaved?:()=>void}) {
  const [reason,setReason]=useState("");
  const [mainRisk,setMainRisk]=useState("");
  const [alternative,setAlternative]=useState("");
  const [saved,setSaved]=useState(false);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{(async()=>{
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){setLoading(false);return}
    const {data}=await supabase.from("research_checkpoints")
      .select("reason,main_risk,alternative_considered")
      .eq("portfolio_id",portfolioId).eq("symbol",symbol).eq("user_id",user.id).maybeSingle();
    if(data){
      setReason(data.reason??"");
      setMainRisk(data.main_risk??"");
      setAlternative(data.alternative_considered??"");
      setSaved(Boolean(data.reason && data.main_risk));
    }
    setLoading(false);
  })()},[portfolioId,symbol]);

  async function save(){
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return;
    await supabase.from("research_checkpoints").upsert({
      user_id:user.id,portfolio_id:portfolioId,category,symbol,
      reason,main_risk:mainRisk,alternative_considered:alternative,
      updated_at:new Date().toISOString()
    },{onConflict:"portfolio_id,symbol"});
    setSaved(true);
    onSaved?.();
  }

  if(loading)return <div className="card"><p className="muted">Loading research checkpoint…</p></div>;

  return (
    <div className="card">
      <p className="muted">Learning checkpoint</p>
      <h3>Explain your decision before moving on</h3>
      <p className="helpText">This is not graded. It helps you make sure you understand what you selected and creates a record you can revisit later.</p>

      <label className="field">Why are you considering {symbol}?
        <select value={reason} onChange={e=>setReason(e.target.value)}>
          <option value="">Choose a reason</option>
          <option>Diversification</option>
          <option>Financial quality</option>
          <option>Growth</option>
          <option>Valuation</option>
          <option>Stability</option>
          <option>Dividend / income</option>
          <option>Low cost</option>
          <option>Other</option>
        </select>
      </label>

      <label className="field">What is the main risk you found?
        <textarea value={mainRisk} onChange={e=>setMainRisk(e.target.value)} placeholder="Example: The fund is heavily concentrated in large technology companies."/>
      </label>

      <label className="field">What alternative did you compare it with?
        <input value={alternative} onChange={e=>setAlternative(e.target.value)} placeholder="Ticker or investment name"/>
      </label>

      <button className="btn btnPrimary" disabled={!reason||!mainRisk.trim()} onClick={save}>
        {saved?"Update checkpoint":"Save checkpoint"}
      </button>
      {saved&&<span className="statusBadge statusInfo" style={{marginLeft:10}}>Saved</span>}
    </div>
  );
}
