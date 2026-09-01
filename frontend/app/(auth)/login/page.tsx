"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [mode,setMode]=useState<"signin"|"signup">("signin");
  useEffect(()=>{if(new URLSearchParams(window.location.search).get("mode")==="signup")setMode("signup")},[]);
  const [message,setMessage]=useState("");

  async function submit(e:FormEvent){
    e.preventDefault();
    const supabase=createClient();
    setMessage("");

    const result = mode==="signup"
      ? await supabase.auth.signUp({email,password})
      : await supabase.auth.signInWithPassword({email,password});

    if(result.error){setMessage(result.error.message);return;}
    window.location.href="/dashboard";
  }

  return (
    <section className="panel" style={{maxWidth:560,margin:"0 auto"}}>
      <h1>{mode==="signin"?"Sign in":"Create your PortfolioPath account"}</h1>
      <p className="muted">Your learning portfolios, questionnaire results, selections, and progress will be tied to your account.</p>
      <form onSubmit={submit}>
        <label className="field">Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" required /></label>
        <label className="field">Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete={mode==="signin"?"current-password":"new-password"} minLength={8} required /></label>
        <button className="btn btnPrimary" type="submit">{mode==="signin"?"Sign in":"Create account"}</button>
      </form>
      {message && <p>{message}</p>}
      <div className="actions">
        <button className="btn btnSecondary" onClick={()=>setMode(mode==="signin"?"signup":"signin")}>
          {mode==="signin"?"Need an account?":"Already have an account?"}
        </button>
      </div>
    </section>
  );
}
