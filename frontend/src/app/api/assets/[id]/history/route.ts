// src/app/api/assets/[id]/history/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const assetId = params.id;
    if (!assetId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const supabase = getRouteHandlerSupabase(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { data, error } = await supabase
      .from("asset_history")
      .select("recorded_date, value, invested_value")
      .eq("asset_id", assetId)
      .eq("user_id", user.id)
      .order("recorded_date", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: any) {
    console.error("[api/assets/history] GET error:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
