import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(){
  const supabase=await createClient();
  const {data:{user},error}=await supabase.auth.getUser();
  if(error||!user) return NextResponse.json({error:"Not authenticated."},{status:401});
  const admin=createAdminClient();
  const {error:deleteError}=await admin.auth.admin.deleteUser(user.id);
  if(deleteError) return NextResponse.json({error:"Account deletion could not be completed."},{status:500});
  return NextResponse.json({ok:true});
}
