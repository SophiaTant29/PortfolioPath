"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [mode,setMode]=useState<"signin"|"signup">("signin");
  const [message,setMessage]=useState("");
  const [agreed,setAgreed]=useState(false);
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    const q=new URLSearchParams(window.location.search);
    if(q.get("mode")==="signup")setMode("signup");
    if(q.get("confirmed")==="1")setMessage("Email confirmed. You can sign in now.");
    if(q.get("confirmation_error")==="1")setMessage("That confirmation link could not be verified. Request a new confirmation email or try signing in again.");
  },[]);

  async function submit(e:FormEvent){
    e.preventDefault();
    if(mode==="signup"&&!agreed){setMessage("Please agree to the Terms of Use and Privacy Notice to create an account.");return;}
    const supabase=createClient();
    setMessage(""); setLoading(true);
    const q=new URLSearchParams(window.location.search);
    const requestedNext=q.get("next");
    const next=requestedNext?.startsWith("/")&&!requestedNext.startsWith("//")?requestedNext:"/dashboard";

    const result = mode==="signup"
      ? await supabase.auth.signUp({
          email,
          password,
          options:{emailRedirectTo:`${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`}
        })
      : await supabase.auth.signInWithPassword({email,password});
    setLoading(false);

    if(result.error){setMessage(result.error.message);return;}
    if(mode==="signup"){
      if(!result.data.session){
        setMessage("Account created. Check your email and click the confirmation link before signing in. If you do not see it, check your spam or junk folder.");
        return;
      }
      // A public deployment is expected to require email confirmation in Supabase.
      // Do not silently continue if the project is misconfigured to issue a session immediately.
      await supabase.auth.signOut();
      setMessage("Account created, but email confirmation is not being enforced by the authentication service. PortfolioPath has signed you out for safety. The site administrator must enable email confirmations before new accounts can continue.");
      return;
    }
    window.location.href=next;
  }

  return (
    <section className="panel" style={{maxWidth:560,margin:"0 auto"}}>
      <h1>{mode==="signin"?"Sign in":"Create your PortfolioPath account"}</h1>
      <p className="muted">Save learning portfolios, questionnaire results, selections, and progress across devices.</p>
      <form onSubmit={submit}>
        <label className="field">Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" required /></label>
        <label className="field">Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete={mode==="signin"?"current-password":"new-password"} minLength={8} required /></label>
        {mode==="signup"&&<label style={{display:"flex",gap:10,alignItems:"flex-start",margin:"14px 0"}}><input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{marginTop:4}}/><span>I agree to the <Link href="/terms">Terms of Use</Link> and acknowledge the <Link href="/privacy">Privacy Notice</Link>.</span></label>}
        <button className="btn btnPrimary" type="submit" disabled={loading}>{loading?(mode==="signin"?"Signing in…":"Creating account…"):(mode==="signin"?"Sign in":"Create account")}</button>
      </form>
      {message && <p>{message}</p>}
      <div className="actions">
        <button className="btn btnSecondary" onClick={()=>{setMode(mode==="signin"?"signup":"signin");setMessage("");}}>{mode==="signin"?"Need an account?":"Already have an account?"}</button>
        {mode==="signin"&&<Link className="btn btnSecondary" href="/forgot-password">Forgot password?</Link>}
      </div>
    </section>
  );
}
