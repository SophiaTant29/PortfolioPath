"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { securityUniverse } from "@/lib/securityUniverse";

export default function WatchlistPage(){
  const params=useParams<{id:string}>();
  const router=useRouter();
  const [items,setItems]=useState<any[]>([]);
  const [symbol,setSymbol]=useState("MSFT");
  const [message,setMessage]=useState("");

  async function load(){
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){router.push("/login");return}
    const {data}=await supabase.from("watchlist_items").select("*").eq("portfolio_id",params.id).eq("user_id",user.id).order("created_at",{ascending:false});
    setItems(data??[]);
  }
  useEffect(()=>{load()},[]);

  async function add(){
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();if(!user)return;
    const meta=securityUniverse.find(s=>s.ticker===symbol);
    if(!meta){setMessage("Choose a symbol from the PortfolioPath security universe.");return}
    const {error}=await supabase.from("watchlist_items").upsert({
      portfolio_id:params.id,user_id:user.id,symbol:meta.ticker,name:meta.name,category:meta.category
    },{onConflict:"portfolio_id,symbol"});
    if(error){setMessage(error.message);return}
    setMessage("");load();
  }

  async function remove(id:string){
    const supabase=createClient();await supabase.from("watchlist_items").delete().eq("id",id);load();
  }

  return <section className="panel">
    <h1>Watchlist</h1>
    <div className="grid">
      <label className="field">Add security
        <input list="watch-options" value={symbol} onChange={e=>setSymbol(e.target.value.toUpperCase())}/>
        <datalist id="watch-options">{securityUniverse.map(s=><option key={`${s.category}-${s.ticker}`} value={s.ticker}>{s.name}</option>)}</datalist>
      </label>
      <div className="field"><span>&nbsp;</span><button className="btn btnPrimary" onClick={add}>Add to Watchlist</button></div>
    </div>
    {message&&<p>{message}</p>}
    <div style={{display:"grid",gap:10,marginTop:16}}>
      {items.map(i=><div className="card" key={i.id}>
        <strong>{i.symbol} — {i.name}</strong><p className="muted">{i.category}</p>
        <div className="actions">
          <Link className="btn btnSecondary" href={`/research/${i.symbol}?portfolio=${params.id}`}>Research</Link>
          <button className="btn btnSecondary" onClick={()=>remove(i.id)}>Remove</button>
        </div>
      </div>)}
    </div>
    <div className="actions"><Link className="btn btnSecondary" href={`/portfolios/${params.id}/insights`}>Back to Insights</Link></div>
  </section>;
}
