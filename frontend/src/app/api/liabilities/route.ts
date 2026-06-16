// src/app/api/liabilities/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";
import type { Liability, LiabilityInsert, LiabilitySummary, LIABILITY_CATEGORY_LABELS, LIABILITY_CATEGORY_COLORS } from "@/types/liabilities";

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
        .select("id, name, outstanding_balance, original_amount, monthly_emi, category, status")
        .eq("user_id", userId)
        .eq("status", "active");

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const items = (data ?? []) as any[];
      const totalOutstanding = items.reduce((s, i) => s + (i.outstanding_balance ?? 0), 0);
      const totalOriginal = items.reduce((s, i) => s + (i.original_amount ?? 0), 0);
      const totalMonthlyEmi = items.reduce((s, i) => s + (i.monthly_emi ?? 0), 0);

      const categoryMap: Record<string, number> = {};
      items.forEach(i => {
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

      const summary: LiabilitySummary = {
        totalOutstanding,
        totalOriginal,
        totalMonthlyEmi,
        liabilityCount: items.length,
        allocation,
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
      status: body.status ?? "active",
      original_amount: body.original_amount ?? body.outstanding_balance,
    };

    const { data, error } = await supabase.from("liabilities").insert(payload as any).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data as Liability, { status: 201 });
  } catch (e: any) {
    console.error("[api/liabilities] POST error:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
