import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const API=process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
const SECRET=process.env.BACKEND_SHARED_SECRET;

async function forward(request:NextRequest, context:{params:Promise<{path:string[]}>}){
  const {path}=await context.params;
  const joined=(path||[]).join("/");
  if(!joined || joined.includes("..")) return NextResponse.json({error:"Invalid backend path."},{status:400});
  const isHealth=joined==="health";
  if(!isHealth){
    const supabase=await createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user) return NextResponse.json({error:"Not authenticated."},{status:401});
  }
  const url=new URL(`${API.replace(/\/$/,"")}/${joined}`);
  request.nextUrl.searchParams.forEach((value,key)=>url.searchParams.append(key,value));
  const headers=new Headers();
  if(SECRET) headers.set("x-portfoliopath-backend-key",SECRET);
  const contentType=request.headers.get("content-type");
  if(contentType)headers.set("content-type",contentType);
  const body=["GET","HEAD"].includes(request.method)?undefined:await request.arrayBuffer();
  try{
    const response=await fetch(url,{method:request.method,headers,body,cache:"no-store"});
    const responseType=response.headers.get("content-type")||"application/json";
    return new NextResponse(await response.arrayBuffer(),{status:response.status,headers:{"content-type":responseType}});
  }catch{
    return NextResponse.json({error:"Analytics service is temporarily unavailable."},{status:502});
  }
}
export const GET=forward;
export const POST=forward;
