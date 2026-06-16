// src/app/api/strategy/[id]/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";
import type { FinancialGoal, GoalUpdate } from "@/types/strategy";

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
      .from("financial_goals")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data as FinancialGoal);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { id } = await params;
    const body = (await request.json()) as GoalUpdate;
    const supabase = getRouteHandlerSupabase(request);

    const updatePayload: any = { ...body, updated_at: new Date().toISOString() };

    // Auto-complete if current >= target
    if (body.current_amount !== undefined) {
      const { data: existing } = await supabase.from("financial_goals").select("target_amount").eq("id", id).single();
      if (existing && body.current_amount >= existing.target_amount) {
        updatePayload.status = "completed";
      }
    }

    const { data, error } = await supabase
      .from("financial_goals")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data as FinancialGoal);
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
      .from("financial_goals")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
