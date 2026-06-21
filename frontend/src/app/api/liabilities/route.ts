// src/app/api/liabilities/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";
import { nextMonthlyDueDate, validatePositive } from "@/lib/finance-records";
import type { Liability, LiabilityInsert, LiabilitySummary } from "@/types/liabilities";

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
        .from("liabilities")
        .select("id, name, outstanding_balance, original_amount, monthly_emi, category, status, next_due_date")
        .eq("user_id", userId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const items = (data ?? []) as any[];
      const activeItems = items.filter(i => i.status === "active");
      const totalOutstanding = activeItems.reduce((s, i) => s + (i.outstanding_balance ?? 0), 0);
      const totalOriginal = activeItems.reduce((s, i) => s + (i.original_amount ?? 0), 0);
      const totalMonthlyEmi = activeItems.reduce((s, i) => s + (i.monthly_emi ?? 0), 0);

      // Debt-to-income ratio
      let debtToIncomeRatio: number | null = null;
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("monthly_income")
          .eq("id", userId)
          .single();
        if (profile?.monthly_income && profile.monthly_income > 0) {
          debtToIncomeRatio = Math.round((totalMonthlyEmi / profile.monthly_income) * 100);
        }
      } catch {}

      // Category allocation
      const categoryMap: Record<string, number> = {};
      activeItems.forEach(i => {
        categoryMap[i.category] = (categoryMap[i.category] ?? 0) + (i.outstanding_balance ?? 0);
      });

      const categoryLabels: Record<string, string> = {
        home_loan: 'Home Loan', auto_loan: 'Auto Loan',
        education_loan: 'Education Loan', personal_loan: 'Personal Loan',
        credit_card: 'Credit Card', other: 'Other',
      };
      const categoryColors: Record<string, string> = {
        home_loan: '#10B981', auto_loan: '#3B82F6',
        education_loan: '#8B5CF6', personal_loan: '#F59E0B',
        credit_card: '#EF4444', other: '#64748B',
      };

      const allocation = Object.entries(categoryMap).map(([cat, val]) => ({
        category: cat as import("@/types/liabilities").LiabilityCategory,
        label: categoryLabels[cat] ?? cat,
        value: val,
        color: categoryColors[cat] ?? '#64748B',
      })).sort((a, b) => b.value - a.value);

      // Next due
      const withDue = activeItems
        .filter(i => i.next_due_date)
        .sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime());
      const nextDue = withDue.length > 0
        ? { name: withDue[0].name, amount: withDue[0].monthly_emi ?? 0, date: withDue[0].next_due_date }
        : undefined;

      const summary: LiabilitySummary = {
        totalOutstanding,
        totalOriginal,
        totalMonthlyEmi,
        liabilityCount: items.length,
        activeLoans: activeItems.length,
        debtToIncomeRatio,
        allocation,
        nextDue,
      };

      return NextResponse.json(summary);
    }

    // Full list
    let query = supabase.from("liabilities").select("*").eq("user_id", userId);
    const categoryFilter = searchParams.get("category");
    if (categoryFilter) query = query.eq("category", categoryFilter);
    const statusFilter = searchParams.get("status");
    if (statusFilter) query = query.eq("status", statusFilter);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data as Liability[]);
  } catch (e: any) {
    console.error("[api/liabilities] GET error:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const body = (await request.json()) as LiabilityInsert;
    const supabase = getRouteHandlerSupabase(request);

    if (!body.name?.trim()) return NextResponse.json({ error: "Liability name is required" }, { status: 400 });
    if (!body.category) return NextResponse.json({ error: "Liability category is required" }, { status: 400 });
    const balanceError = validatePositive(body.outstanding_balance, "Outstanding balance");
    if (balanceError) return NextResponse.json({ error: balanceError }, { status: 400 });

    const payload = {
      ...body,
      user_id: userId,
      name: body.name.trim(),
      status: body.status ?? "active",
      original_amount: body.original_amount ?? body.outstanding_balance,
      next_due_date: body.next_due_date ?? (body.start_date ? nextMonthlyDueDate(body.start_date, 0) : null),
    };

    const { data, error } = await supabase.from("liabilities").insert(payload as any).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("liability_history").insert({
      liability_id: data.id,
      user_id: userId,
      recorded_date: new Date().toISOString().split("T")[0],
      outstanding_balance: data.outstanding_balance,
    } as any);

    return NextResponse.json(data as Liability, { status: 201 });
  } catch (e: any) {
    console.error("[api/liabilities] POST error:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
