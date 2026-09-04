"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage(){
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);
  async function submit(e:FormEvent){
    e.preventDefault();
    if(password!==confirm){setMessage("Passwords do not match.");return;}
    setLoading(true); setMessage("");
    const supabase=createClient();
    const {error}=await supabase.auth.updateUser({password});
    setLoading(false);
    if(error){setMessage(error.message);return;}
    setMessage("Password updated. Redirecting to your portfolios…");
    window.setTimeout(()=>{window.location.href="/dashboard"},700);
  }
  return <section className="panel" style={{maxWidth:560,margin:"0 auto"}}>
    <p className="sectionEyebrow">Account recovery</p><h1>Choose a new password</h1>
    <form onSubmit={submit}>
      <label className="field">New password<input type="password" autoComplete="new-password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required/></label>
      <label className="field">Confirm password<input type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={e=>setConfirm(e.target.value)} required/></label>
      <button className="btn btnPrimary" disabled={loading}>{loading?"Updating…":"Update password"}</button>
    </form>{message&&<p>{message}</p>}
  </section>;
}
