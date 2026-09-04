import { type EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNext(value:string|null){
  if(!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export async function GET(request:NextRequest){
  const {searchParams}=new URL(request.url);
  const tokenHash=searchParams.get("token_hash");
  const type=searchParams.get("type") as EmailOtpType|null;
  const code=searchParams.get("code");
  const next=safeNext(searchParams.get("next"));
  const supabase=await createClient();

  let error:Error|null=null;
  if(tokenHash && type){
    const result=await supabase.auth.verifyOtp({type,token_hash:tokenHash});
    error=result.error;
  }else if(code){
    const result=await supabase.auth.exchangeCodeForSession(code);
    error=result.error;
  }

  const url=request.nextUrl.clone();
  if(!error && (tokenHash || code)){
    url.pathname=next;
    url.search="";
    return NextResponse.redirect(url);
  }
  url.pathname="/login";
  url.search="?confirmation_error=1";
  return NextResponse.redirect(url);
}
