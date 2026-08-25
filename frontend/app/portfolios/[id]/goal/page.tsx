"use client";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function GoalPage(){
  const params=useParams<{id:string}>();
  const router=useRouter();
  const [amount,setAmount]=useState("");
  const [date,setDate]=useState("");
  const [message,setMessage]=useState("");

  useEffect(()=>{(async()=>{
    const supabase=createClient();
    const {data:p}=await supabase.from("portfolios").select("goal").eq("id",params.id).single();
    if(p?.goal){setAmount(String(p.goal.targetAmount??""));setDate(p.goal.targetDate??"")}
  })()},[params.id]);

  async function submit(e:FormEvent){
    e.preventDefault();
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){router.push("/login");return}
    const {error}=await supabase.from("portfolios").update({
      goal:{targetAmount:Number(amount),targetDate:date||null},
      updated_at:new Date().toISOString()
    }).eq("id",params.id).eq("user_id",user.id);
    if(error){setMessage(error.message);return}
    router.push(`/portfolios/${params.id}/insights`);
  }

  return <section className="panel" style={{maxWidth:650}}>
    <h1>Investment Goal</h1>
    <form onSubmit={submit}>
      <label className="field">Target portfolio value<input type="number" min="1" step="100" value={amount} onChange={e=>setAmount(e.target.value)} required/></label>
      <label className="field">Target date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
      <button className="btn btnPrimary">Save Goal</button>
    </form>
    {message&&<p>{message}</p>}
  </section>;
}
