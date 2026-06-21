// src/app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const supabase = getRouteHandlerSupabase(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const [{ data: profile }, commitmentsRes, assetsRes, liabilitiesRes, goalsRes] = await Promise.all([
    supabase.from("profiles").select("monthly_income").eq("id", user.id).single(),
    supabase
      .from("commitments")
      .select("monthly_amount, outstanding_balance, status, progress_percentage")
      .eq("user_id", user.id),
    supabase.from("assets").select("current_value, status").eq("user_id", user.id),
    supabase.from("liabilities").select("outstanding_balance, monthly_emi, status").eq("user_id", user.id),
    supabase.from("financial_goals").select("target_amount, current_amount, status").eq("user_id", user.id),
  ]);

  const monthlyIncome = profile?.monthly_income ?? 0;
  const commitments = Array.isArray(commitmentsRes.data) ? commitmentsRes.data : [];
  const assets = Array.isArray(assetsRes.data) ? assetsRes.data : [];
  const liabilities = Array.isArray(liabilitiesRes.data) ? liabilitiesRes.data : [];
  const goals = Array.isArray(goalsRes.data) ? goalsRes.data : [];

  const activeCommitments = commitments.filter((c) =>
    ["active", "due_soon", "overdue"].includes(c.status)
  );
  const activeLiabilities = liabilities.filter((l) => l.status === "active");
  const activeAssets = assets.filter((a) => a.status === "active");

  const totalMonthlyBurden = activeCommitments.reduce((sum, c) => sum + (c.monthly_amount ?? 0), 0);
  const liabilityMonthlyEmi = activeLiabilities.reduce((sum, l) => sum + (l.monthly_emi ?? 0), 0);
  const monthlyCommitments = totalMonthlyBurden + liabilityMonthlyEmi;
  const totalOutstanding = commitments.reduce((sum, c) => sum + (c.outstanding_balance ?? 0), 0);
  const totalAssets = activeAssets.reduce((sum, a) => sum + (a.current_value ?? 0), 0);
  const totalLiabilities = activeLiabilities.reduce((sum, l) => sum + (l.outstanding_balance ?? 0), 0);
  const netWorth = totalAssets - totalLiabilities;
  const monthlySavings = Math.max(0, monthlyIncome - monthlyCommitments);
  const activeEMICount = activeCommitments.length + activeLiabilities.length;
  const goalProgress = goals.length
    ? Math.round(
        goals.reduce((sum, goal) => {
          const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
          return sum + Math.min(100, progress);
        }, 0) / goals.length
      )
    : 0;

  let healthScore = 75;
  if (monthlyIncome > 0) {
    const burdenRatio = monthlyCommitments / monthlyIncome;
    const savingsRatio = monthlySavings / monthlyIncome;
    const avgRepaymentProgress = commitments.length
      ? commitments.reduce((sum, c) => sum + (c.progress_percentage ?? 0), 0) / commitments.length
      : 50;
    const overdueCount = commitments.filter((c) => c.status === "overdue").length;
    const netWorthScore = totalAssets > 0 ? Math.max(0, Math.min(100, ((netWorth / totalAssets) + 1) * 50)) : 50;
    const burdenScore = Math.max(0, Math.min(100, (1 - burdenRatio / 0.8) * 100));
    const savingsScore = Math.min(100, (savingsRatio / 0.3) * 100);
    const overduePenalty = Math.min(100, overdueCount * 15);

    healthScore = Math.round(
      burdenScore * 0.35 +
        savingsScore * 0.25 +
        avgRepaymentProgress * 0.15 +
        goalProgress * 0.1 +
        netWorthScore * 0.05 +
        (100 - overduePenalty) * 0.1
    );
    healthScore = Math.max(0, Math.min(100, healthScore));
  }

  let healthAdvice = "Your financial health is strong. Keep building your emergency fund.";
  if (healthScore < 40) {
    healthAdvice = "Your financial health needs attention. Reduce high-interest debt and review monthly commitments.";
  } else if (healthScore < 70) {
    healthAdvice = "Your finances are fair. Focus on debt payoff consistency and goal contributions.";
  }

  return NextResponse.json({
    monthlyIncome,
    monthlySavings,
    totalMonthlyBurden,
    liabilityMonthlyEmi,
    monthlyCommitments,
    totalOutstanding,
    totalAssets,
    totalLiabilities,
    netWorth,
    goalProgress,
    activeEMICount,
    healthScore,
    healthAdvice,
    trends: {
      income: "neutral",
      savings: monthlySavings > monthlyIncome * 0.2 ? "up" : monthlySavings > 0 ? "neutral" : "down",
    },
  });
}
