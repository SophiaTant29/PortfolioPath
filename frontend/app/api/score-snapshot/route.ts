import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req:NextRequest){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});

  const body=await req.json();
  const {error}=await supabase.from("security_score_snapshots").insert({
    user_id:user.id,
    portfolio_id:body.portfolio_id??null,
    symbol:body.symbol,
    security_type:body.security_type,
    scoring_method:body.scoring_method??null,
    match_score:body.match_score??null,
    quality_score:body.quality_score??null,
    estimated_risk:body.estimated_risk??null,
    score_payload:body.score_payload??body
  });

  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({ok:true});
}
