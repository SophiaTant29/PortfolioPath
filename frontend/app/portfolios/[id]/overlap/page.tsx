"use client";
import { useEffect,useState } from "react";
import { useParams,useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const API=process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function ETFOverlapPage(){
  const params=useParams<{id:string}>();
  const router=useRouter();
  const [symbols,setSymbols]=useState<string[]>([]);
  const [data,setData]=useState<any>(null);
  const [message,setMessage]=useState("");

  useEffect(()=>{(async()=>{
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){router.push("/login");return}
    const {data:rows}=await supabase.from("portfolio_selections").select("symbol,security_type").eq("portfolio_id",params.id).eq("user_id",user.id);
    setSymbols((rows??[]).filter((r:any)=>r.security_type==="ETF").map((r:any)=>r.symbol));
  })()},[params.id,router]);

  async function analyze(){
    if(symbols.length<2){setMessage("Add at least two ETFs to analyze overlap.");return}
    try{
      const r=await fetch(`${API}/api/etf/overlap`,{
        method:"POST",headers:{"content-type":"application/json"},
        body:JSON.stringify({symbols})
      });
      if(!r.ok)throw new Error();
      setData(await r.json());setMessage("");
    }catch{setMessage("ETF overlap data could not be loaded.");}
  }

  return <section className="panel">
    <p className="muted">ETF Analysis</p>
    <h1>Holdings Overlap</h1>
    <p>Two ETFs can look diversified individually while owning many of the same underlying companies.</p>
    <p><strong>ETFs in portfolio:</strong> {symbols.length?symbols.join(", "):"None"}</p>
    <div className="actions"><button className="btn btnPrimary" onClick={analyze}>Analyze ETF Overlap</button></div>
    {message&&<p>{message}</p>}
    {data?.pairwise?.map((p:any)=><div className="card" key={`${p.a}-${p.b}`} style={{marginTop:12}}>
      <strong>{p.a} + {p.b}</strong>
      <p>Estimated shared portfolio weight: <strong>{Number(p.overlap_pct).toFixed(1)}%</strong></p>
      <p className="muted">{p.common_holdings} common underlying holdings found.</p>
      {p.top_common?.length>0&&<p>Largest overlaps: {p.top_common.slice(0,5).map((x:any)=>x.ticker).join(", ")}</p>}
    </div>)}
    <div className="actions"><Link className="btn btnSecondary" href={`/portfolios/${params.id}/insights`}>Back to Insights</Link></div>
  </section>;
}
