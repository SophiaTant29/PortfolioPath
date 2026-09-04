"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NewPortfolioPage(){
  const [name,setName]=useState("Long-Term Growth");
  const [startDate,setStartDate]=useState(new Date().toISOString().slice(0,10));
  const [message,setMessage]=useState("");

  async function submit(e:FormEvent){
    e.preventDefault();
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){window.location.href="/login";return;}

    const {data,error}=await supabase.from("portfolios").insert({
      user_id:user.id,name,mode:"Practice",start_date:startDate,benchmark_symbol:"SP500TR"
    }).select("id").single();

    if(error){setMessage(error.message);return;}
    window.location.href=`/portfolios/${data.id}/questionnaire`;
  }

  return (
    <section className="panel" style={{maxWidth:680}}>
      <h1>Create Learning Portfolio</h1>
      <p className="muted">Every PortfolioPath portfolio is an educational exercise, so there is no separate purpose or trading mode to choose.</p>
      <form onSubmit={submit}>
        <label className="field">Portfolio name<input value={name} onChange={e=>setName(e.target.value)} required /></label>
        <label className="field">Start date<input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} required /></label>
        <button className="btn btnPrimary">Create Learning Portfolio</button>
      </form>
      {message&&<p>{message}</p>}
    </section>
  );
}
