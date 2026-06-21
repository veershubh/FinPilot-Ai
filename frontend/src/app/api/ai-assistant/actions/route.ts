import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";
import { buildCommitmentTracking, nextMonthlyDueDate } from "@/lib/finance-records";

type AssistantActionType = "create_commitment" | "create_asset" | "create_liability" | "create_goal";

async function getUserId(request: Request): Promise<string | null> {
  const supabase = getRouteHandlerSupabase(request);
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user?.id ?? null;
}

function endDateFromMonths(startDate: string, months: number): string | null {
  if (!months || months <= 0) return null;
  const date = new Date(`${startDate}T00:00:00`);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split("T")[0];
}

export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { actionType, payload } = (await request.json()) as {
    actionType?: AssistantActionType;
    payload?: Record<string, any>;
  };

  if (!actionType || !payload) {
    return NextResponse.json({ error: "Missing actionType or payload" }, { status: 400 });
  }

  const supabase = getRouteHandlerSupabase(request);
  const today = new Date().toISOString().split("T")[0];

  if (actionType === "create_commitment") {
    const startDate = payload.start_date || today;
    const endDate = payload.end_date ?? endDateFromMonths(startDate, Number(payload.tenure_months ?? 0));
    const originalAmount = Math.max(0, Number(payload.original_amount ?? payload.monthly_amount ?? 0));
    const tracking = buildCommitmentTracking({
      originalAmount,
      outstandingBalance: payload.outstanding_balance ?? originalAmount,
      monthlyAmount: Number(payload.monthly_amount ?? 0),
      startDate,
      endDate,
      monthsCompleted: 0,
    });

    const { data, error } = await supabase
      .from("commitments")
      .insert({
        user_id: userId,
        title: String(payload.title || "New Commitment").slice(0, 100),
        category: payload.category || "other",
        provider: payload.provider ?? null,
        description: payload.description ?? "Created via AI Assistant",
        original_amount: originalAmount,
        outstanding_balance: tracking.outstandingBalance,
        monthly_amount: Number(payload.monthly_amount ?? 0),
        interest_rate: Number(payload.interest_rate ?? 0),
        start_date: startDate,
        end_date: endDate,
        next_due_date: tracking.nextDueDate,
        progress_percentage: tracking.progressPercentage,
        months_completed: tracking.monthsCompleted,
        months_remaining: tracking.monthsRemaining,
        status: tracking.status,
      } as any)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ actionType, record: data }, { status: 201 });
  }

  if (actionType === "create_asset") {
    const currentValue = Number(payload.current_value ?? 0);
    const investedValue = Number(payload.invested_value ?? currentValue);
    const returnsPercentage = investedValue > 0 ? Math.round(((currentValue - investedValue) / investedValue) * 10000) / 100 : 0;
    const { data, error } = await supabase
      .from("assets")
      .insert({
        user_id: userId,
        name: String(payload.name || payload.title || "New Asset").slice(0, 100),
        category: payload.category || "other",
        institution: payload.institution ?? null,
        current_value: currentValue,
        invested_value: investedValue,
        returns_percentage: returnsPercentage,
        maturity_date: payload.maturity_date ?? null,
        interest_rate: Number(payload.interest_rate ?? 0),
        units: payload.units ?? null,
        notes: payload.notes ?? "Created via AI Assistant",
        status: "active",
      } as any)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await supabase.from("asset_history").insert({
      asset_id: data.id,
      user_id: userId,
      recorded_date: today,
      value: data.current_value,
      invested_value: data.invested_value,
    } as any);
    return NextResponse.json({ actionType, record: data }, { status: 201 });
  }

  if (actionType === "create_liability") {
    const startDate = payload.start_date ?? today;
    const outstanding = Number(payload.outstanding_balance ?? payload.original_amount ?? 0);
    const { data, error } = await supabase
      .from("liabilities")
      .insert({
        user_id: userId,
        name: String(payload.name || payload.title || "New Liability").slice(0, 100),
        category: payload.category || "other",
        institution: payload.institution ?? payload.provider ?? null,
        outstanding_balance: outstanding,
        original_amount: Number(payload.original_amount ?? outstanding),
        interest_rate: Number(payload.interest_rate ?? 0),
        monthly_emi: Number(payload.monthly_emi ?? payload.monthly_amount ?? 0),
        start_date: startDate,
        end_date: payload.end_date ?? null,
        next_due_date: payload.next_due_date ?? nextMonthlyDueDate(startDate),
        notes: payload.notes ?? "Created via AI Assistant",
        status: "active",
      } as any)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await supabase.from("liability_history").insert({
      liability_id: data.id,
      user_id: userId,
      recorded_date: today,
      outstanding_balance: data.outstanding_balance,
    } as any);
    return NextResponse.json({ actionType, record: data }, { status: 201 });
  }

  if (actionType === "create_goal") {
    const targetAmount = Number(payload.target_amount ?? 0);
    const currentAmount = Number(payload.current_amount ?? 0);
    const { data, error } = await supabase
      .from("financial_goals")
      .insert({
        user_id: userId,
        title: String(payload.title || "New Goal").slice(0, 100),
        category: payload.category || "savings",
        target_amount: targetAmount,
        current_amount: currentAmount,
        monthly_contribution: Number(payload.monthly_contribution ?? 0),
        target_date: payload.target_date ?? null,
        priority: payload.priority ?? "medium",
        status: currentAmount >= targetAmount ? "completed" : "active",
        notes: payload.notes ?? "Created via AI Assistant",
      } as any)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ actionType, record: data }, { status: 201 });
  }

  return NextResponse.json({ error: "Unsupported action type" }, { status: 400 });
}
