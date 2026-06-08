// src/lib/commitment-ai.ts
"use server";

import { groq } from "@/lib/groq";
import { getServerSupabase } from "@/utils/supabase/server";
import { calcHealthScore, type HealthScoreInput } from "@/utils/commitment-calculator";
import { HEALTH_SCORE_IMPACT } from "@/types/commitments";
import type { Commitment, CommitmentAIInsight } from "@/types/database";

/**
 * Build full copilot context for AI prompts — aggregates user's financial state.
 */
export async function buildCopilotContext(userId: string) {
  const supabase = await getServerSupabase();

  const [txRes, commitRes, goalRes, budgetRes, subRes] = await Promise.all([
    supabase.from("transactions").select("type, amount, category").eq("user_id", userId),
    supabase.from("commitments").select("*").eq("user_id", userId),
    supabase.from("goals").select("title, target_amount, current_amount, status").eq("user_id", userId),
    supabase.from("budgets").select("category, monthly_limit, spent_amount").eq("user_id", userId),
    supabase.from("subscriptions").select("name, amount").eq("user_id", userId),
  ]);

  const transactions = (txRes.data ?? []) as any[];
  const commitments = (commitRes.data ?? []) as Commitment[];
  const goals = (goalRes.data ?? []) as any[];
  const budgets = (budgetRes.data ?? []) as any[];
  const subscriptions = (subRes.data ?? []) as any[];

  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + (t.amount ?? 0), 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + (t.amount ?? 0), 0);
  const totalCommitments = commitments.filter(c => c.status === "active").reduce((s, c) => s + (c.monthly_amount ?? 0), 0);
  const totalOutstanding = commitments.reduce((s, c) => s + (c.outstanding_balance ?? 0), 0);
  const activeCommitments = commitments.filter(c => c.status === "active");
  const overdueCommitments = commitments.filter(c => c.status === "overdue");

  const healthInput: HealthScoreInput = {
    income: totalIncome || 80000,
    totalExpenses: totalExpense,
    totalCommitments,
    totalDebt: totalOutstanding,
    savings: Math.max(0, totalIncome - totalExpense - totalCommitments) * 6,
  };
  const health = calcHealthScore(healthInput);

  return {
    income: totalIncome,
    expenses: totalExpense,
    balance: totalIncome - totalExpense,
    commitments: {
      active: activeCommitments.length,
      overdue: overdueCommitments.length,
      totalMonthly: totalCommitments,
      totalOutstanding,
      list: activeCommitments.map(c => ({
        title: c.title, category: c.category, monthly: c.monthly_amount,
        outstanding: c.outstanding_balance, progress: c.progress_percentage,
        status: c.status, nextDue: c.next_due_date,
      })),
    },
    goals: goals.map(g => ({ title: g.title, target: g.target_amount, current: g.current_amount, status: g.status })),
    budgets: budgets.map(b => ({ category: b.category, limit: b.monthly_limit, spent: b.spent_amount })),
    subscriptions: subscriptions.map(s => ({ name: s.name, amount: s.amount })),
    healthScore: health.score,
    healthGrade: health.grade,
    healthBreakdown: health.breakdown,
    burdenRatio: totalIncome > 0 ? Math.round((totalCommitments / totalIncome) * 100) : 0,
    dtiRatio: totalIncome > 0 ? Math.round((totalOutstanding / (totalIncome * 12)) * 100) : 0,
  };
}

/**
 * Generate AI insight for a commitment using Groq.
 */
export async function generateCommitmentInsight(
  userId: string,
  commitmentId: string
): Promise<CommitmentAIInsight | null> {
  const supabase = await getServerSupabase();
  const context = await buildCopilotContext(userId);

  const { data: commitment } = await supabase.from("commitments").select("*").eq("id", commitmentId).single();
  if (!commitment) return null;
  const c = commitment as Commitment;

  const categoryImpact = HEALTH_SCORE_IMPACT[c.category as keyof typeof HEALTH_SCORE_IMPACT] ?? -2;
  const affordability = context.income > 0
    ? Math.max(0, Math.min(100, Math.round(((context.income - context.expenses - context.commitments.totalMonthly) / context.income) * 100)))
    : 0;
  const risk = context.burdenRatio > 50 ? 85 : context.burdenRatio > 35 ? 60 : 30;
  const projectedHealth = Math.max(0, Math.min(100, context.healthScore + categoryImpact));

  // Generate AI recommendation via Groq
  let recommendation = `Health impact: ${categoryImpact > 0 ? "+" : ""}${categoryImpact}. Burden ratio: ${context.burdenRatio}%.`;
  try {
    const chat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "system",
        content: "You are FinPilot AI, a financial advisor. Give a 2-3 sentence recommendation about this commitment's impact on the user's finances. Be specific with numbers."
      }, {
        role: "user",
        content: `User context: income ₹${context.income}/mo, expenses ₹${context.expenses}/mo, ${context.commitments.active} active commitments totaling ₹${context.commitments.totalMonthly}/mo, health score ${context.healthScore}/100, burden ratio ${context.burdenRatio}%.
Commitment: "${c.title}" (${c.category}), ₹${c.monthly_amount}/mo, ₹${c.outstanding_balance} outstanding, ${c.progress_percentage}% complete.`
      }],
      temperature: 0.3,
      max_tokens: 150,
    });
    recommendation = chat.choices?.[0]?.message?.content ?? recommendation;
  } catch (e) {
    console.warn("[commitment-ai] Groq call failed, using fallback:", e);
  }

  // Store insight
  const { data: insight, error } = await supabase.from("commitment_ai_insights").insert({
    commitment_id: commitmentId,
    user_id: userId,
    affordability_score: affordability,
    risk_score: risk,
    financial_impact_score: Math.abs(categoryImpact) * 10,
    health_score_impact: categoryImpact,
    projected_health_score: projectedHealth,
    recommendation,
  } as any).select().single();

  if (error) { console.error("[commitment-ai] Insert failed:", error); return null; }
  return insight as CommitmentAIInsight;
}
