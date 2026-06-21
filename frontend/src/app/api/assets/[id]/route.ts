// src/app/api/assets/[id]/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";
import type { Asset, AssetUpdate } from "@/types/assets";

async function getUserId(request: Request): Promise<string | null> {
  const supabase = getRouteHandlerSupabase(request);
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user?.id ?? null;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { id } = await params;
    const supabase = getRouteHandlerSupabase(request);

    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data as Asset);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { id } = await params;
    const body = (await request.json()) as AssetUpdate;
    const supabase = getRouteHandlerSupabase(request);

    const updatePayload: any = { ...body, updated_at: new Date().toISOString() };

    // Recalculate returns if value changed
    if (body.current_value !== undefined || body.invested_value !== undefined) {
      const { data: existing } = await supabase
        .from("assets")
        .select("current_value, invested_value")
        .eq("id", id)
        .eq("user_id", userId)
        .single();
      if (existing) {
        const cv = body.current_value ?? existing.current_value;
        const iv = body.invested_value ?? existing.invested_value;
        updatePayload.returns_percentage = iv > 0 ? Math.round(((cv - iv) / iv) * 100 * 100) / 100 : 0;
      }
    }

    const { data, error } = await supabase
      .from("assets")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (body.current_value !== undefined || body.invested_value !== undefined) {
      await supabase.from("asset_history").insert({
        asset_id: id,
        user_id: userId,
        recorded_date: new Date().toISOString().split("T")[0],
        value: data.current_value,
        invested_value: data.invested_value,
      } as any);
    }

    return NextResponse.json(data as Asset);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { id } = await params;
    const supabase = getRouteHandlerSupabase(request);

    const { error } = await supabase
      .from("assets")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
