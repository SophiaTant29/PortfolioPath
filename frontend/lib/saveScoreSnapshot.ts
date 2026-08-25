export async function saveScoreSnapshot(payload:{
  portfolio_id?:string|null;
  symbol:string;
  security_type:string;
  scoring_method?:string|null;
  match_score?:number|null;
  quality_score?:number|null;
  estimated_risk?:number|null;
  [key:string]:any;
}){
  try{
    await fetch("/api/score-snapshot",{
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify(payload)
    });
  }catch{
    // Snapshot persistence should never block research.
  }
}
