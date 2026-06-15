// src/app/api/timeline/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";
import type { FinancialTimeline, FinancialTimelineInsert, FinancialTimelineUpdate } from "@/types/database";

/** Helper to extract user id from request cookies (Supabase auth). */
async function getUserId(request: Request): Promise<string | null> {
  const supabase = getRouteHandlerSupabase(request);
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user?.id ?? null;
}

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const supabase = getRouteHandlerSupabase(request);
  const { data, error } = await supabase
    .from("financial_timeline")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data as FinancialTimeline[]);
}

export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const body = (await request.json()) as FinancialTimelineInsert;
  const item: FinancialTimelineInsert = { ...body, user_id: userId };

  const supabase = getRouteHandlerSupabase(request);
  const { data, error } = await supabase.from("financial_timeline").insert(item).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data?.[0] as FinancialTimeline, { status: 201 });
}

export async function DELETE(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const body = (await request.json()) as { id: string };
  const { id } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = getRouteHandlerSupabase(request);
  const { data, error } = await supabase.from("financial_timeline").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true }, { status: 200 });
}

// PUT to update a timeline item
export async function PUT(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const body = (await request.json()) as { id: string; updates: Partial<FinancialTimeline> };
  const { id, updates } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = getRouteHandlerSupabase(request);
  const { data, error } = await supabase
    .from("financial_timeline")
    .update(updates)
    .eq("id", id)
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data?.[0] as FinancialTimeline, { status: 200 });
}
