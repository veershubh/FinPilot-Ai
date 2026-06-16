// src/app/api/liabilities/[id]/route.ts
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
      .from("liabilities")
      .select("*")
      .eq("id", liabilityId)
      .eq("user_id", user.id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data);
  } catch (e: any) {
    console.error("[api/liabilities/id] GET error:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const liabilityId = params.id;
    if (!liabilityId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const supabase = getRouteHandlerSupabase(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const body = await request.json();

    const { data, error } = await supabase
      .from("liabilities")
      .update(body)
      .eq("id", liabilityId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: any) {
    console.error("[api/liabilities/id] PATCH error:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const liabilityId = params.id;
    if (!liabilityId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const supabase = getRouteHandlerSupabase(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { error } = await supabase
      .from("liabilities")
      .delete()
      .eq("id", liabilityId)
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("[api/liabilities/id] DELETE error:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
