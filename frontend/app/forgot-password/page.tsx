"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage(){
  const [email,setEmail]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);
  async function submit(e:FormEvent){
    e.preventDefault(); setLoading(true); setMessage("");
    const supabase=createClient();
    const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/update-password`});
    setLoading(false);
    if(error){setMessage(error.message);return;}
    setMessage("If an account exists for that email, a password-reset message has been sent. Check your inbox and spam folder.");
  }
  return <section className="panel" style={{maxWidth:560,margin:"0 auto"}}>
    <p className="sectionEyebrow">Account recovery</p><h1>Reset your password</h1>
    <p className="muted">Enter the email associated with your PortfolioPath account.</p>
    <form onSubmit={submit}><label className="field">Email<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><button className="btn btnPrimary" disabled={loading}>{loading?"Sending…":"Send reset email"}</button></form>
    {message&&<p>{message}</p>}
    <div className="actions"><Link className="btn btnSecondary" href="/login">Back to sign in</Link></div>
  </section>;
}
