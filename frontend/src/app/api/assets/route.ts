// src/app/api/assets/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";
import type { Asset, AssetInsert, AssetSummary } from "@/types/assets";
import { validatePositive } from "@/lib/finance-records";

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
        .from("assets")
        .select("id, name, current_value, invested_value, returns_percentage, category, status")
        .eq("user_id", userId)
        .eq("status", "active");

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const items = (data ?? []) as any[];
      const totalValue = items.reduce((s, i) => s + (i.current_value ?? 0), 0);
      const totalInvested = items.reduce((s, i) => s + (i.invested_value ?? 0), 0);
      const overallReturns = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

      const categoryMap: Record<string, number> = {};
      let topAsset: any = null;
      let maxReturn = -Infinity;

      items.forEach(i => {
        categoryMap[i.category] = (categoryMap[i.category] ?? 0) + (i.current_value ?? 0);
        const ret = i.returns_percentage ?? 0;
        if (ret > maxReturn) {
          maxReturn = ret;
          topAsset = i;
        }
      });

      const categoryLabels: Record<string, string> = {
        bank_account: 'Bank Account', fixed_deposit: 'Fixed Deposit',
        mutual_fund: 'Mutual Fund', stock: 'Stock', gold: 'Gold',
        real_estate: 'Real Estate', crypto: 'Crypto', other: 'Other',
      };
      const categoryColors: Record<string, string> = {
        bank_account: '#3B82F6', fixed_deposit: '#8B5CF6',
        mutual_fund: '#10B981', stock: '#F59E0B', gold: '#EAB308',
        real_estate: '#EF4444', crypto: '#14B8A6', other: '#64748B',
      };

      const allocation = Object.entries(categoryMap).map(([cat, val]) => ({
        category: cat as import("@/types/assets").AssetCategory,
        label: categoryLabels[cat] ?? cat,
        value: val,
        color: categoryColors[cat] ?? '#64748B',
      })).sort((a, b) => b.value - a.value);

      // Fetch 30-day old history for growth calc
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: historyData } = await supabase
        .from("asset_history")
        .select("value")
        .eq("user_id", userId)
        .gte("recorded_date", thirtyDaysAgo.toISOString().split('T')[0])
        .order("recorded_date", { ascending: true })
        .limit(100);

      let monthlyGrowth = 0;
      if (historyData && historyData.length > 0) {
        // approximate past portfolio value
        const pastValue = historyData[0].value * items.length; // rough estimate
        if (pastValue > 0 && totalValue > 0) {
          monthlyGrowth = ((totalValue - pastValue) / pastValue) * 100;
        }
      } else if (totalInvested > 0) {
         // Fallback if no history
         monthlyGrowth = ((totalValue - totalInvested) / totalInvested) * 10; // rough 1/10th of total returns
      }

      const summary: AssetSummary = {
        totalValue,
        totalInvested,
        overallReturns: Math.round(overallReturns * 100) / 100,
        assetCount: items.length,
        allocation,
        topPerforming: topAsset ? { name: topAsset.name, returns: topAsset.returns_percentage } : undefined,
        growth: { monthly: Math.round(monthlyGrowth * 100) / 100, yearly: Math.round(monthlyGrowth * 12 * 100) / 100 }
      };

      return NextResponse.json(summary);
    }

    // Full list
    let query = supabase.from("assets").select("*").eq("user_id", userId);
    const categoryFilter = searchParams.get("category");
    if (categoryFilter) query = query.eq("category", categoryFilter);
    const statusFilter = searchParams.get("status");
    if (statusFilter) query = query.eq("status", statusFilter);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data as Asset[]);
  } catch (e: any) {
    console.error("[api/assets] GET error:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const body = (await request.json()) as AssetInsert;
    const supabase = getRouteHandlerSupabase(request);

    if (!body.name?.trim()) return NextResponse.json({ error: "Asset name is required" }, { status: 400 });
    if (!body.category) return NextResponse.json({ error: "Asset category is required" }, { status: 400 });
    const valueError = validatePositive(body.current_value, "Current value");
    if (valueError) return NextResponse.json({ error: valueError }, { status: 400 });

    const investedValue = body.invested_value ?? body.current_value;
    const returnsPercentage = investedValue > 0
      ? ((body.current_value - investedValue) / investedValue) * 100
      : 0;

    const payload = {
      ...body,
      user_id: userId,
      name: body.name.trim(),
      invested_value: investedValue,
      returns_percentage: Math.round(returnsPercentage * 100) / 100,
      status: body.status ?? "active",
    };

    const { data, error } = await supabase.from("assets").insert(payload as any).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("asset_history").insert({
      asset_id: data.id,
      user_id: userId,
      recorded_date: new Date().toISOString().split("T")[0],
      value: data.current_value,
      invested_value: data.invested_value,
    } as any);

    return NextResponse.json(data as Asset, { status: 201 });
  } catch (e: any) {
    console.error("[api/assets] POST error:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
