// src/app/api/liabilities/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";
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
        .select("outstanding_balance, monthly_emi, interest_rate, original_amount, category, status")
        .eq("user_id", userId)
        .eq("status", "active");

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const items = (data ?? []) as Pick<Liability, "outstanding_balance" | "monthly_emi" | "interest_rate" | "original_amount" | "category" | "status">[];
      const totalDebt = items.reduce((s, i) => s + (i.outstanding_balance ?? 0), 0);
      const totalMonthlyObligation = items.reduce((s, i) => s + (i.monthly_emi ?? 0), 0);

      // Weighted average interest rate by outstanding balance
      const totalWeighted = items.reduce((s, i) => s + (i.outstanding_balance ?? 0) * (i.interest_rate ?? 0), 0);
      const weightedAvgRate = totalDebt > 0 ? Math.round((totalWeighted / totalDebt) * 100) / 100 : 0;

      const categoryLabels: Record<string, string> = {
        home_loan: 'Home Loan', vehicle_loan: 'Vehicle Loan',
        personal_loan: 'Personal Loan', education_loan: 'Education Loan',
        credit_card: 'Credit Card', business_loan: 'Business Loan', other: 'Other',
      };
      const categoryColors: Record<string, string> = {
        home_loan: '#EF4444', vehicle_loan: '#F59E0B',
        personal_loan: '#8B5CF6', education_loan: '#3B82F6',
        credit_card: '#EC4899', business_loan: '#14B8A6', other: '#64748B',
      };

      const catMap: Record<string, number> = {};
      items.forEach(i => {
        catMap[i.category] = (catMap[i.category] ?? 0) + (i.outstanding_balance ?? 0);
      });

      const categoryBreakdown = Object.entries(catMap).map(([cat, val]) => ({
        category: cat as any,
        label: categoryLabels[cat] ?? cat,
        value: val,
        color: categoryColors[cat] ?? '#64748B',
      }));

      const summary: LiabilitySummary = {
        totalDebt,
        totalMonthlyObligation,
        weightedAvgRate,
        liabilityCount: items.length,
        categoryBreakdown,
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

    const payload = {
      ...body,
      user_id: userId,
      outstanding_balance: body.outstanding_balance ?? body.original_amount,
      status: body.status ?? "active",
    };

    const { data, error } = await supabase.from("liabilities").insert(payload as any).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data as Liability, { status: 201 });
  } catch (e: any) {
    console.error("[api/liabilities] POST error:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
