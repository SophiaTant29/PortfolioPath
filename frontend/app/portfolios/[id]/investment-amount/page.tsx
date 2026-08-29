"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function InvestmentAmountPage(){
  const params=useParams<{id:string}>();
  const router=useRouter();
  const [amount,setAmount]=useState("");
  const [percentOnly,setPercentOnly]=useState(false);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{(async()=>{
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){router.push("/login");return}
    const {data:p}=await supabase.from("portfolios").select("risk_profile").eq("id",params.id).eq("user_id",user.id).single();
    const existing=p?.risk_profile?.plannedInvestment;
    if(existing) setAmount(String(existing));
    if(p?.risk_profile?.percentageOnly) setPercentOnly(true);
    setLoading(false);
  })()},[params.id,router]);

  async function save(){
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return;
    const {data:p}=await supabase.from("portfolios").select("risk_profile").eq("id",params.id).eq("user_id",user.id).single();
    const rp={...(p?.risk_profile??{}),plannedInvestment:percentOnly?null:Number(amount||0),percentageOnly:percentOnly};
    await supabase.from("portfolios").update({risk_profile:rp}).eq("id",params.id).eq("user_id",user.id);
    router.push(`/portfolios/${params.id}/build`);
  }

  if(loading)return <section className="panel">Loading…</section>;

  return (
    <section className="panel">
      <p className="muted">Portfolio setup</p>
      <h1>How much are you planning to invest?</h1>
      <p>This lets PortfolioPath translate allocation percentages into dollar amounts and suggest a reasonable number of holdings in each category.</p>

      <label className="field">
        Planned investment amount
        <input type="number" min="0" step="100" placeholder="Example: 10000" value={amount} disabled={percentOnly} onChange={e=>setAmount(e.target.value)}/>
      </label>

      <label style={{display:"flex",gap:10,alignItems:"flex-start",marginTop:14}}>
        <input type="checkbox" checked={percentOnly} onChange={e=>setPercentOnly(e.target.checked)}/>
        <span>
          <strong>I’m not sure how much I’ll invest yet</strong>
          <span className="muted" style={{display:"block"}}>Show percentages only. You can add a dollar amount later.</span>
        </span>
      </label>

      <div className="actions">
        <button className="btn btnPrimary" disabled={!percentOnly && Number(amount)<=0} onClick={save}>Continue to Guided Builder</button>
      </div>
    </section>
  );
}
