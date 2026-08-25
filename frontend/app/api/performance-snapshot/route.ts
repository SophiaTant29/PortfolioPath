import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req:NextRequest){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  const body=await req.json();
  if(!body.portfolio_id || !body.snapshot_date)return NextResponse.json({error:"Missing fields"},{status:400});
  const row={
    portfolio_id:body.portfolio_id,
    user_id:user.id,
    snapshot_date:body.snapshot_date,
    portfolio_value:Number(body.portfolio_value),
    portfolio_return:Number(body.portfolio_return),
    benchmark_return:Number(body.benchmark_return),
    excess_return:Number(body.excess_return),
    max_drawdown:Number(body.max_drawdown),
    annualized_volatility:Number(body.annualized_volatility),
    start_date:body.start_date??null,
    end_date:body.end_date??null,
    observations:Number(body.observations??0),
    benchmark_symbol:body.benchmark_symbol??null,
  };
  const {error}=await supabase.from("performance_snapshots").upsert(row,{onConflict:"portfolio_id,snapshot_date"});
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({ok:true});
}
