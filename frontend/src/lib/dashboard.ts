import { getSupabase } from '@/lib/supabaseClient';
import type { Transaction, Budget, Goal, Subscription, AIInsight, Commitment } from '@/types/database';

/**
 * High‑level aggregation for the dashboard.
 * Server‑side function that fetches all needed data in parallel.
 */
export interface DashboardOverview {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  upcomingBills: Subscription[];
  recentInsights: AIInsight[];
  goals: Goal[];
  budgets: Budget[];
  transactions: Transaction[];
  // Commitments integration
  totalMonthlyCommitments: number;
  commitmentCount: number;
  upcomingCommitments: Commitment[];
}

export const getDashboardOverview = async (userId: string): Promise<DashboardOverview> => {
  const supabase = getSupabase();

  // Parallel fetches (including commitments)
  const [txRes, subRes, insightRes, goalRes, budgetRes, commitRes] = await Promise.all([
    supabase.from('transactions').select('id, user_id, title, type, amount, notes, category, transaction_date, created_at').eq('user_id', userId),
    supabase.from('subscriptions').select('id, user_id, name, amount, renewal_date, category, created_at').eq('user_id', userId).gte('renewal_date', new Date().toISOString()),
    supabase.from('ai_insights').select('id, user_id, title, description, confidence_score, severity, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    supabase.from('goals').select('id, user_id, title, target_amount, current_amount, target_date, status, created_at').eq('user_id', userId),
    supabase.from('budgets').select('id, user_id, category, monthly_limit, spent_amount, period, created_at').eq('user_id', userId),
    supabase.from('commitments').select('*').eq('user_id', userId).in('status', ['active', 'upcoming', 'due_soon'] as any),
  ]);

  if (txRes.error) throw txRes.error;
  if (subRes.error) throw subRes.error;
  if (insightRes.error) throw insightRes.error;
  if (goalRes.error) throw goalRes.error;
  if (budgetRes.error) throw budgetRes.error;
  // commitments are best-effort – don't throw if the table doesn't exist yet
  const commitments = (commitRes.data ?? []) as Commitment[];

  const transactions = txRes.data as Transaction[];
  const upcomingBills = subRes.data as Subscription[];
  const recentInsights = insightRes.data as AIInsight[];
  const goals = goalRes.data as Goal[];
  const budgets = budgetRes.data as Budget[];

  // Compute totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);
  const balance = totalIncome - totalExpense;

  // Commitment aggregates
  const totalMonthlyCommitments = commitments.reduce(
    (sum, c) => sum + (c.monthly_amount ?? 0),
    0
  );
  const commitmentCount = commitments.length;
  // Upcoming: due within next 7 days
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingCommitments = commitments.filter((c) => {
    if (!c.next_due_date) return false;
    const due = new Date(c.next_due_date);
    return due >= now && due <= weekFromNow;
  });

  return {
    totalIncome,
    totalExpense,
    balance,
    upcomingBills,
    recentInsights,
    goals,
    budgets,
    transactions,
    totalMonthlyCommitments,
    commitmentCount,
    upcomingCommitments,
  };
};
