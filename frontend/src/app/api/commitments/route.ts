// src/app/api/commitments/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";
import { generateCommitmentInsight } from "@/lib/commitment-ai";
import { buildCommitmentTracking, validatePositive } from "@/lib/finance-records";
import type { Commitment, CommitmentInsert } from "@/types/database";

async function getUserId(request: Request): Promise<string | null> {
  const supabase = getRouteHandlerSupabase(request);
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user?.id ?? null;
}

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const isSummary = searchParams.get("summary") === "true";
  const supabase = getRouteHandlerSupabase(request);

  if (isSummary) {
    const { data, error } = await supabase
      .from("commitments")
      .select("monthly_amount, outstanding_balance, status, category, progress_percentage")
      .eq("user_id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const items = data as Pick<Commitment, "monthly_amount" | "outstanding_balance" | "status" | "category" | "progress_percentage">[];
    const totalMonthlyBurden = items.reduce((s, i) => s + (i.monthly_amount ?? 0), 0);
    const totalOutstanding = items.reduce((s, i) => s + (i.outstanding_balance ?? 0), 0);
    const activeCount = items.filter(i => i.status === "active").length;
    const upcomingCount = items.filter(i => i.status === "upcoming").length;
    const completedCount = items.filter(i => i.status === "completed").length;
    const overdueCount = items.filter(i => i.status === "overdue").length;
    const avgProgress = items.length > 0 ? Math.round(items.reduce((s, i) => s + (i.progress_percentage ?? 0), 0) / items.length) : 0;

    const categoryBreakdown: Record<string, { count: number; monthly: number }> = {};
    items.forEach(i => {
      if (!categoryBreakdown[i.category]) categoryBreakdown[i.category] = { count: 0, monthly: 0 };
      categoryBreakdown[i.category].count += 1;
      categoryBreakdown[i.category].monthly += i.monthly_amount ?? 0;
    });

    return NextResponse.json({ totalMonthlyBurden, totalOutstanding, activeCount, upcomingCount, completedCount, overdueCount, avgProgress, categoryBreakdown });
  }

  let query = supabase.from("commitments").select("*").eq("user_id", userId);
  const statusFilter = searchParams.get("status");
  if (statusFilter) query = query.in("status", statusFilter.split(",") as any);
  const categoryFilter = searchParams.get("category");
  if (categoryFilter) query = query.in("category", categoryFilter.split(",") as any);

  const { data, error } = await query.order("next_due_date", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data as Commitment[]);
}

export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const body = (await request.json()) as CommitmentInsert;
  const supabase = getRouteHandlerSupabase(request);

  if (!body.title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  if (!body.category) return NextResponse.json({ error: "Category is required" }, { status: 400 });
  if (!body.start_date) return NextResponse.json({ error: "Start date is required" }, { status: 400 });
  const monthlyError = validatePositive(body.monthly_amount, "Monthly amount");
  if (monthlyError) return NextResponse.json({ error: monthlyError }, { status: 400 });

  const originalAmount = Math.max(0, Number(body.original_amount ?? body.monthly_amount));
  const tracking = buildCommitmentTracking({
    originalAmount,
    outstandingBalance: body.outstanding_balance ?? originalAmount,
    monthlyAmount: body.monthly_amount,
    startDate: body.start_date,
    endDate: body.end_date,
    monthsCompleted: 0,
  });

  const payload = {
    ...body,
    user_id: userId,
    title: body.title.trim(),
    original_amount: originalAmount,
    outstanding_balance: tracking.outstandingBalance,
    progress_percentage: tracking.progressPercentage,
    months_completed: tracking.monthsCompleted,
    months_remaining: tracking.monthsRemaining,
    next_due_date: tracking.nextDueDate,
    status: tracking.status,
  };

  const { data, error } = await supabase.from("commitments").insert(payload as any).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const created = data as Commitment;

  // Fire-and-forget AI insight generation
  generateCommitmentInsight(userId, created.id).catch(e =>
    console.warn("[commitment-ai] Background insight generation failed:", e)
  );

  return NextResponse.json(created, { status: 201 });
}
