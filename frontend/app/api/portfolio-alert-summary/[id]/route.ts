import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { compareScoreSnapshots, portfolioStructureAlerts, sortAlerts } from "@/lib/changeIntelligence";

export async function GET(_:NextRequest,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});

  const [{data:p},{data:sels},{data:scores}]=await Promise.all([
    supabase.from("portfolios").select("*").eq("id",id).eq("user_id",user.id).single(),
    supabase.from("portfolio_selections").select("*").eq("portfolio_id",id).eq("user_id",user.id),
    supabase.from("security_score_snapshots").select("*").eq("portfolio_id",id).eq("user_id",user.id).order("created_at",{ascending:false}).limit(250),
  ]);

  if(!p)return NextResponse.json({error:"Portfolio not found"},{status:404});

  const grouped:Record<string,any[]>={};
  for(const s of scores??[]){
    grouped[s.symbol]=grouped[s.symbol]??[];
    grouped[s.symbol].push(s);
  }

  let alerts:any[]=[];
  for(const rows of Object.values(grouped)){
    alerts.push(...compareScoreSnapshots(rows[0],rows[1]??null,id));
  }
  alerts.push(...portfolioStructureAlerts(sels??[],p.risk_profile?.allocation??[],null,id));

  return NextResponse.json({alerts:sortAlerts(alerts).slice(0,20)});
}
