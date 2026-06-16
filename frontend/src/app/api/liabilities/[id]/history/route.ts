// src/app/api/liabilities/[id]/history/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const liabilityId = params.id;
    if (!liabilityId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const supabase = getRouteHandlerSupabase(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { data, error } = await supabase
      .from("liability_history")
      .select("recorded_date, outstanding_balance")
      .eq("liability_id", liabilityId)
      .eq("user_id", user.id)
      .order("recorded_date", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: any) {
    console.error("[api/liabilities/history] GET error:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
