import { getSupabase } from '@/lib/supabaseClient';
import type { Transaction, Budget, Goal, Subscription, AIInsight } from '@/types/database';

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
}

export const getDashboardOverview = async (userId: string): Promise<DashboardOverview> => {
  const supabase = getSupabase();

  // Parallel fetches
  const [txRes, subRes, insightRes, goalRes, budgetRes] = await Promise.all([
    supabase.from('transactions').select('id, user_id, title, type, amount, notes, category, transaction_date, created_at').eq('user_id', userId),
    supabase.from('subscriptions').select('id, user_id, name, amount, renewal_date, category, created_at').eq('user_id', userId).gte('renewal_date', new Date().toISOString()),
    supabase.from('ai_insights').select('id, user_id, title, description, confidence_score, severity, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    supabase.from('goals').select('id, user_id, title, target_amount, current_amount, target_date, status, created_at').eq('user_id', userId),
    supabase.from('budgets').select('id, user_id, category, monthly_limit, spent_amount, period, created_at').eq('user_id', userId),
  ]);

  if (txRes.error) throw txRes.error;
  if (subRes.error) throw subRes.error;
  if (insightRes.error) throw insightRes.error;
  if (goalRes.error) throw goalRes.error;
  if (budgetRes.error) throw budgetRes.error;

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

  return {
    totalIncome,
    totalExpense,
    balance,
    upcomingBills,
    recentInsights,
    goals,
    budgets,
    transactions,
  };
};
