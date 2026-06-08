// src/app/api/commitments/simulate/route.ts
import { NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";
import { buildCopilotContext } from "@/lib/commitment-ai";
import { simulateNewCommitment } from "@/utils/commitment-calculator";
import { HEALTH_SCORE_IMPACT } from "@/types/commitments";

async function getUserId(): Promise<string | null> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user?.id ?? null;
}

/**
 * POST /api/commitments/simulate
 * What-If simulator — evaluates a hypothetical commitment against real user data.
 * Body: { monthly_amount, original_amount, category }
 */
export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const body = await request.json();
  const { monthly_amount, original_amount, category } = body;

  if (!monthly_amount || !original_amount || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const context = await buildCopilotContext(userId);
    const result = simulateNewCommitment(
      {
        income: context.income || 80000,
        totalExpenses: context.expenses,
        totalCommitments: context.commitments.totalMonthly,
        totalDebt: context.commitments.totalOutstanding,
        savings: Math.max(0, context.balance - context.commitments.totalMonthly) * 6,
      },
      { monthly_amount, original_amount, category },
      HEALTH_SCORE_IMPACT
    );
    return NextResponse.json({ ...result, context: { healthScore: context.healthScore, burdenRatio: context.burdenRatio } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
