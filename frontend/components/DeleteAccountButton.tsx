"use client";
import { useState } from "react";

export default function DeleteAccountButton(){
  const [confirming,setConfirming]=useState(false);
  const [text,setText]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);
  if(!confirming)return <button className="btn btnSecondary" onClick={()=>setConfirming(true)}>Delete account</button>;
  async function remove(){
    if(text!=="DELETE"){setMessage("Type DELETE exactly to confirm.");return;}
    setLoading(true);setMessage("");
    const res=await fetch("/api/account/delete",{method:"POST"});
    const body=await res.json().catch(()=>({}));
    if(!res.ok){setLoading(false);setMessage(body.error||"Account deletion failed.");return;}
    window.location.href="/";
  }
  return <div className="card" style={{marginTop:12}}>
    <strong>Delete account and saved data</strong>
    <p className="muted">This permanently deletes your PortfolioPath account. User-owned portfolio records are configured to cascade-delete with the account.</p>
    <label className="field">Type DELETE to confirm<input value={text} onChange={e=>setText(e.target.value)} /></label>
    <div className="actions"><button className="btn btnSecondary" onClick={()=>{setConfirming(false);setText("");setMessage("")}}>Cancel</button><button className="btn btnPrimary" onClick={remove} disabled={loading}>{loading?"Deleting…":"Permanently delete"}</button></div>
    {message&&<p>{message}</p>}
  </div>;
}
