// src/app/api/notifications/read/route.ts
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { ids } = await request.json();
  if (!Array.isArray(ids) || !ids.length) {
    return NextResponse.json({ error: "ids required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("commitment_notifications")
    .update({ is_read: true } as any)
    .in("id", ids)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
