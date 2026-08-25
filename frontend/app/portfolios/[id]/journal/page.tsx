"use client";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function JournalPage(){
  const params=useParams<{id:string}>();
  const router=useRouter();
  const [entries,setEntries]=useState<any[]>([]);
  const [symbol,setSymbol]=useState("");
  const [action,setAction]=useState("Buy");
  const [confidence,setConfidence]=useState("Medium");
  const [reason,setReason]=useState("");
  const [message,setMessage]=useState("");

  async function load(){
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();if(!user){router.push("/login");return}
    const {data}=await supabase.from("journal_entries").select("*").eq("portfolio_id",params.id).eq("user_id",user.id).order("entry_date",{ascending:false});
    setEntries(data??[]);
  }
  useEffect(()=>{load()},[]);

  async function submit(e:FormEvent){
    e.preventDefault();
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();if(!user)return;
    const {error}=await supabase.from("journal_entries").insert({
      portfolio_id:params.id,user_id:user.id,symbol:symbol.toUpperCase(),action,confidence,reason,
      entry_date:new Date().toISOString().slice(0,10)
    });
    if(error){setMessage(error.message);return}
    setSymbol("");setReason("");setMessage("");load();
  }

  return <section className="panel">
    <h1>Decision Journal</h1>
    <p className="muted">Record why you made an investment decision so you can evaluate the decision process later, not only the outcome.</p>
    <form onSubmit={submit}>
      <div className="grid">
        <label className="field">Ticker<input value={symbol} onChange={e=>setSymbol(e.target.value)} required/></label>
        <label className="field">Decision<select value={action} onChange={e=>setAction(e.target.value)}><option>Buy</option><option>Hold</option><option>Sell</option><option>Watch</option></select></label>
        <label className="field">Confidence<select value={confidence} onChange={e=>setConfidence(e.target.value)}><option>Low</option><option>Medium</option><option>High</option></select></label>
      </div>
      <label className="field">Why are you making this decision?<textarea rows={4} value={reason} onChange={e=>setReason(e.target.value)} required/></label>
      <button className="btn btnPrimary">Save Journal Entry</button>
    </form>
    {message&&<p>{message}</p>}
    <div style={{marginTop:18}}>
      {entries.map(e=><div className="card" key={e.id} style={{marginBottom:10}}>
        <strong>{e.symbol} — {e.action}</strong>
        <p className="muted">{e.entry_date} • {e.confidence} confidence</p>
        <p>{e.reason}</p>
      </div>)}
    </div>
    <div className="actions"><Link className="btn btnSecondary" href={`/portfolios/${params.id}/insights`}>Back to Insights</Link></div>
  </section>;
}
