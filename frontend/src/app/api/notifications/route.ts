// src/app/api/notifications/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const supabase = getRouteHandlerSupabase(request);
  const { data: authData, error: userError } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { data: notifications, error } = await supabase
    .from("commitment_notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(notifications ?? []);
}
