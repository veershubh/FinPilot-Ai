// src/app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";

/**
 * GET /api/dashboard/stats
 *
 * Returns real-time dashboard statistics computed from
 * the user's profile and commitments data.
 */
export async function GET(request: Request) {
  const supabase = getRouteHandlerSupabase(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // ── 1. Fetch profile (for income) ──────────────────────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("monthly_income")
    .eq("id", user.id)
    .single();

  const monthlyIncome = profile?.monthly_income ?? 0;

  // ── 2. Fetch all commitments ───────────────────────────────────────────
  const { data: commitments } = await supabase
    .from("commitments")
    .select(
      "monthly_amount, outstanding_balance, status, category, progress_percentage, interest_rate"
    )
    .eq("user_id", user.id);

  const items = Array.isArray(commitments) ? commitments : [];

  const activeItems = items.filter(
    (c) => c.status === "active" || c.status === "due_soon" || c.status === "overdue"
  );

  const activeEMICount = activeItems.length;
  const totalMonthlyBurden = activeItems.reduce(
    (s, c) => s + (c.monthly_amount ?? 0),
    0
  );
  const totalOutstanding = items.reduce(
    (s, c) => s + (c.outstanding_balance ?? 0),
    0
  );

  // ── 3. Compute savings (income minus burden) ──────────────────────────
  const monthlySavings = Math.max(0, monthlyIncome - totalMonthlyBurden);

  // ── 4. Compute health score (0–100) ───────────────────────────────────
  //
  // Scoring factors:
  //   - Burden ratio   (40%): lower burden/income ratio → higher score
  //   - Savings ratio  (30%): higher savings/income → higher score
  //   - Progress       (20%): average repayment progress
  //   - Overdue penalty(10%): deduction for overdue commitments
  //
  let healthScore = 75; // baseline for users with no data

  if (monthlyIncome > 0) {
    const burdenRatio = totalMonthlyBurden / monthlyIncome;
    const savingsRatio = monthlySavings / monthlyIncome;
    const avgProgress =
      items.length > 0
        ? items.reduce((s, c) => s + (c.progress_percentage ?? 0), 0) /
          items.length
        : 50;
    const overdueCount = items.filter((c) => c.status === "overdue").length;

    // Burden component: 100 at 0% burden, 0 at 80%+ burden
    const burdenScore = Math.max(0, Math.min(100, (1 - burdenRatio / 0.8) * 100));

    // Savings component: 0 at 0%, 100 at 30%+
    const savingsScore = Math.min(100, (savingsRatio / 0.3) * 100);

    // Progress component: direct percentage
    const progressScore = avgProgress;

    // Overdue penalty: -15 per overdue commitment, floor 0
    const overduePenalty = Math.min(100, overdueCount * 15);

    healthScore = Math.round(
      burdenScore * 0.4 +
        savingsScore * 0.3 +
        progressScore * 0.2 +
        (100 - overduePenalty) * 0.1
    );
    healthScore = Math.max(0, Math.min(100, healthScore));
  } else if (items.length === 0) {
    // New user with no income set and no commitments
    healthScore = 75;
  }

  // ── 5. Compute trends (compare to last month — simplified) ────────────
  // Without historical data, we derive trend from commitment health
  const burdenRatio = monthlyIncome > 0 ? totalMonthlyBurden / monthlyIncome : 0;
  const incomeTrend =
    monthlyIncome > 0 ? ("neutral" as const) : ("neutral" as const);
  const savingsTrend: "up" | "down" | "neutral" =
    monthlySavings > monthlyIncome * 0.2
      ? "up"
      : monthlySavings > 0
      ? "neutral"
      : "down";

  // ── 6. Health advice ──────────────────────────────────────────────────
  let healthAdvice = "Your financial health is strong. Keep building your emergency fund.";
  if (healthScore < 40) {
    healthAdvice =
      "Your financial health needs attention. Consider reducing commitments or increasing income.";
  } else if (healthScore < 70) {
    healthAdvice =
      "Your finances are fair. Focus on paying down high-interest debt and building savings.";
  }

  return NextResponse.json({
    monthlyIncome,
    monthlySavings,
    totalMonthlyBurden,
    totalOutstanding,
    activeEMICount,
    healthScore,
    healthAdvice,
    trends: {
      income: incomeTrend,
      savings: savingsTrend,
    },
  });
}
