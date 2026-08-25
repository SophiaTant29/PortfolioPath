"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cashRemaining, positionFromTransactions, Tx } from "@/lib/transactions";
import { securityUniverse } from "@/lib/securityUniverse";

const API=process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function PracticePage(){
  const params=useParams<{id:string}>();
  const router=useRouter();

  const [portfolio,setPortfolio]=useState<any>(null);
  const [transactions,setTransactions]=useState<Tx[]>([]);
  const [symbol,setSymbol]=useState("MSFT");
  const [type,setType]=useState<"BUY"|"SELL">("BUY");
  const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const [price,setPrice]=useState("");
  const [amount,setAmount]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(true);

  useEffect(()=>{(async()=>{
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){router.push("/login");return;}

    const [{data:p},{data:txs}] = await Promise.all([
      supabase.from("portfolios").select("*").eq("id",params.id).eq("user_id",user.id).single(),
      supabase.from("transactions").select("*").eq("portfolio_id",params.id).eq("user_id",user.id).order("trade_date",{ascending:false})
    ]);

    setPortfolio(p);
    setTransactions((txs??[]).map((t:any)=>({
      ...t,
      shares:Number(t.shares),
      price:Number(t.price),
      fees:Number(t.fees||0),
    })));
    setLoading(false);
  })()},[params.id,router]);

  const startingCash=Number(portfolio?.risk_profile?.answers?.amount ?? 0);
  const cash=useMemo(()=>cashRemaining(startingCash,transactions),[startingCash,transactions]);
  const selected=securityUniverse.find(s=>s.ticker===symbol);
  const position=useMemo(()=>positionFromTransactions(transactions,symbol),[transactions,symbol]);

  async function loadPrice(){
    setMessage("");
    try{
      const r=await fetch(`${API}/api/security/${encodeURIComponent(symbol)}`);
      if(!r.ok)throw new Error();
      const j=await r.json();
      const q=Array.isArray(j.quote)?j.quote[0]:j.quote;
      if(q?.price){
        setPrice(Number(q.price).toFixed(2));
        setMessage("Current market price loaded.");
      } else setMessage("A current price was not available.");
    }catch{
      setMessage("Live price could not be loaded. You can enter a practice price manually.");
    }
  }

  async function submit(e:FormEvent){
    e.preventDefault();
    setMessage("");

    const px=Number(price);
    const dollars=Number(amount);
    if(!symbol||px<=0||dollars<=0){
      setMessage("Enter a valid symbol, price, and dollar amount.");
      return;
    }

    const shares=dollars/px;

    if(type==="BUY" && dollars>cash+0.01){
      setMessage(`This purchase exceeds your remaining practice cash of $${cash.toLocaleString(undefined,{maximumFractionDigits:2})}.`);
      return;
    }

    if(type==="SELL" && shares>position.shares+1e-8){
      setMessage(`You only have ${position.shares.toFixed(4)} simulated shares of ${symbol} available to sell.`);
      return;
    }

    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){router.push("/login");return;}

    const meta=securityUniverse.find(s=>s.ticker===symbol);
    const row={
      portfolio_id:params.id,
      user_id:user.id,
      symbol,
      name:meta?.name ?? symbol,
      category:meta?.category ?? null,
      transaction_type:type,
      trade_date:date,
      shares,
      price:px,
      fees:0,
      notes:"Practice transaction"
    };

    const {data,error}=await supabase.from("transactions").insert(row).select("*").single();
    if(error){setMessage(error.message);return;}

    setTransactions(prev=>[{...data,shares:Number(data.shares),price:Number(data.price),fees:Number(data.fees||0)},...prev]);
    setAmount("");
    setMessage(`Recorded ${type} of ${shares.toFixed(4)} shares at $${px.toFixed(2)}.`);
  }

  if(loading)return <section className="panel">Loading Practice Mode…</section>;
  if(!portfolio)return <section className="panel">Portfolio not found.</section>;

  const positions=[...new Set(transactions.map(t=>t.symbol))]
    .map(ticker=>{
      const p=positionFromTransactions(transactions,ticker);
      const meta=securityUniverse.find(s=>s.ticker===ticker);
      return {ticker,name:meta?.name??ticker,...p};
    }).filter(p=>p.shares>1e-8);

  return (
    <>
      <section className="panel">
        <p className="muted">Practice Mode</p>
        <h1>{portfolio.name}</h1>
        <p>Record simulated investment decisions without using real money.</p>

        <div className="grid">
          <div className="card"><span className="muted">Starting practice cash</span><div className="kpi">${startingCash.toLocaleString(undefined,{maximumFractionDigits:0})}</div></div>
          <div className="card"><span className="muted">Cash remaining</span><div className="kpi">${cash.toLocaleString(undefined,{maximumFractionDigits:2})}</div></div>
          <div className="card"><span className="muted">Transactions</span><div className="kpi">{transactions.length}</div></div>
        </div>
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>Record a Transaction</h2>
        <form onSubmit={submit}>
          <div className="grid">
            <label className="field">Symbol
              <input value={symbol} onChange={e=>setSymbol(e.target.value.toUpperCase())} list="security-options"/>
              <datalist id="security-options">
                {securityUniverse.map(s=><option key={`${s.category}-${s.ticker}`} value={s.ticker}>{s.name}</option>)}
              </datalist>
            </label>

            <label className="field">Action
              <select value={type} onChange={e=>setType(e.target.value as "BUY"|"SELL")}>
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
            </label>

            <label className="field">Date
              <input type="date" value={date} onChange={e=>setDate(e.target.value)}/>
            </label>
          </div>

          <div className="grid">
            <label className="field">Price per share
              <input type="number" min="0.01" step="0.01" value={price} onChange={e=>setPrice(e.target.value)}/>
            </label>

            <label className="field">Dollar amount
              <input type="number" min="0.01" step="10" value={amount} onChange={e=>setAmount(e.target.value)}/>
            </label>

            <div className="field">
              <span className="muted">Estimated shares</span>
              <div className="kpi" style={{fontSize:20}}>{Number(price)>0&&Number(amount)>0?(Number(amount)/Number(price)).toFixed(4):"—"}</div>
            </div>
          </div>

          <div className="actions">
            <button type="button" className="btn btnSecondary" onClick={loadPrice}>Load Current Price</button>
            <button type="submit" className="btn btnPrimary">Record Transaction</button>
          </div>
          {message&&<p>{message}</p>}
        </form>
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>Open Simulated Positions</h2>
        {positions.length===0?<p className="muted">No open positions yet.</p>:positions.map(p=>(
          <div className="card" key={p.ticker} style={{marginBottom:10}}>
            <strong>{p.ticker} — {p.name}</strong>
            <p className="muted">{p.shares.toFixed(4)} shares</p>
            <p>Average cost: ${p.avgCost.toFixed(2)} • Cost basis: ${p.costBasis.toLocaleString(undefined,{maximumFractionDigits:2})}</p>
          </div>
        ))}
      </section>

      <section className="panel" style={{marginTop:16}}>
        <h2>Transaction History</h2>
        {transactions.length===0?<p className="muted">No transactions recorded.</p>:transactions.map((t:any)=>(
          <div className="card" key={t.id} style={{marginBottom:10}}>
            <strong>{t.trade_date} • {t.transaction_type} • {t.symbol}</strong>
            <p>{Number(t.shares).toFixed(4)} shares @ ${Number(t.price).toFixed(2)}</p>
          </div>
        ))}
        <div className="actions">
          <Link className="btn btnSecondary" href={`/portfolios/${params.id}`}>Back to Portfolio</Link>
          <Link className="btn btnPrimary" href={`/portfolios/${params.id}/performance`}>View Performance</Link>
        </div>
      </section>
    </>
  );
}
