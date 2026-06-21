// src/app/api/strategy/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";
import { validatePositive } from "@/lib/finance-records";
import type { FinancialGoal, GoalInsert, StrategySummary } from "@/types/strategy";

async function getUserId(request: Request): Promise<string | null> {
  const supabase = getRouteHandlerSupabase(request);
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user?.id ?? null;
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const isSummary = searchParams.get("summary") === "true";
    const supabase = getRouteHandlerSupabase(request);

    if (isSummary) {
      const { data, error } = await supabase
        .from("financial_goals")
        .select("target_amount, current_amount, monthly_contribution, status")
        .eq("user_id", userId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const items = (data ?? []) as Pick<FinancialGoal, "target_amount" | "current_amount" | "monthly_contribution" | "status">[];
      const activeGoals = items.filter(i => i.status === "active");
      const completedGoals = items.filter(i => i.status === "completed");
      const totalTarget = items.reduce((s, i) => s + (i.target_amount ?? 0), 0);
      const totalSaved = items.reduce((s, i) => s + (i.current_amount ?? 0), 0);
      const avgProgress = items.length > 0
        ? Math.round(items.reduce((s, i) => {
            const pct = i.target_amount > 0 ? (i.current_amount / i.target_amount) * 100 : 0;
            return s + pct;
          }, 0) / items.length)
        : 0;
      const totalMonthlyContribution = activeGoals.reduce((s, i) => s + (i.monthly_contribution ?? 0), 0);

      const summary: StrategySummary = {
        totalGoals: items.length,
        activeGoals: activeGoals.length,
        completedGoals: completedGoals.length,
        totalTarget,
        totalSaved,
        avgProgress,
        totalMonthlyContribution,
      };

      return NextResponse.json(summary);
    }

    // Full list
    let query = supabase.from("financial_goals").select("*").eq("user_id", userId);
    const statusFilter = searchParams.get("status");
    if (statusFilter) query = query.eq("status", statusFilter);
    const categoryFilter = searchParams.get("category");
    if (categoryFilter) query = query.eq("category", categoryFilter);

    const { data, error } = await query.order("priority", { ascending: true }).order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data as FinancialGoal[]);
  } catch (e: any) {
    console.error("[api/strategy] GET error:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const body = (await request.json()) as GoalInsert;
    const supabase = getRouteHandlerSupabase(request);

    if (!body.title?.trim()) return NextResponse.json({ error: "Goal title is required" }, { status: 400 });
    if (!body.category) return NextResponse.json({ error: "Goal category is required" }, { status: 400 });
    const targetError = validatePositive(body.target_amount, "Target amount");
    if (targetError) return NextResponse.json({ error: targetError }, { status: 400 });

    const payload = {
      ...body,
      user_id: userId,
      title: body.title.trim(),
      current_amount: body.current_amount ?? 0,
      monthly_contribution: body.monthly_contribution ?? 0,
      priority: body.priority ?? "medium",
      status: (body.current_amount ?? 0) >= body.target_amount ? "completed" : body.status ?? "active",
    };

    const { data, error } = await supabase.from("financial_goals").insert(payload as any).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data as FinancialGoal, { status: 201 });
  } catch (e: any) {
    console.error("[api/strategy] POST error:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
