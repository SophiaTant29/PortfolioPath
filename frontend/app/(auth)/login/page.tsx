"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [mode,setMode]=useState<"signin"|"signup">("signin");
  useEffect(()=>{
    const q=new URLSearchParams(window.location.search);
    if(q.get("mode")==="signup")setMode("signup");
    if(q.get("confirmed")==="1")setMessage("Email confirmed. You can sign in now.");
  },[]);
  const [message,setMessage]=useState("");

  async function submit(e:FormEvent){
    e.preventDefault();
    const supabase=createClient();
    setMessage("");

    const result = mode==="signup"
      ? await supabase.auth.signUp({
          email,
          password,
          options:{emailRedirectTo:`${window.location.origin}/login?confirmed=1`}
        })
      : await supabase.auth.signInWithPassword({email,password});

    if(result.error){setMessage(result.error.message);return;}
    if(mode==="signup"){
      if(!result.data.session){
        setMessage("Account created. Check your email and click the confirmation link before signing in. If you do not see it, check your spam or junk folder.");
        return;
      }
      setMessage("Account created. Email confirmation is not currently required by Supabase; enable Confirm email in Supabase Auth before public testing.");
      return;
    }
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
