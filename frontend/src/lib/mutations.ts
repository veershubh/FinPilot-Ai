import { getSupabase } from '@/lib/supabaseClient';
import type {
  TransactionInsert,
  TransactionUpdate,
  GoalInsert,
  GoalUpdate,
  BudgetInsert,
  BudgetUpdate,
  SubscriptionInsert,
  SubscriptionUpdate,
} from '@/types/database';

/** Optimistic UI helper – simply returns the optimistic result and updates the cache if you use a cache library. */

// Transactions
export const addTransaction = async (tx: TransactionInsert) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('transactions').insert(tx).select();
  if (error) throw error;
  // Optimistic: you could update a local cache here (e.g., SWR mutate('/api/transactions'))
  return data[0];
};

export const deleteTransaction = async (id: string) => {
  const supabase = getSupabase();
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
  return true;
};

export const updateTransaction = async (id: string, updates: TransactionUpdate) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
};

// Goals
export const createGoal = async (goal: GoalInsert) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('goals').insert(goal).select();
  if (error) throw error;
  return data[0];
};

export const updateGoal = async (id: string, updates: GoalUpdate) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('goals').update(updates).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

export const deleteGoal = async (id: string) => {
  const supabase = getSupabase();
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw error;
  return true;
};

// Budgets
export const createBudget = async (budget: BudgetInsert) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('budgets').insert(budget).select();
  if (error) throw error;
  return data[0];
};

export const updateBudget = async (id: string, updates: BudgetUpdate) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('budgets').update(updates).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

export const deleteBudget = async (id: string) => {
  const supabase = getSupabase();
  const { error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) throw error;
  return true;
};

// Subscriptions
export const createSubscription = async (sub: SubscriptionInsert) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('subscriptions').insert(sub).select();
  if (error) throw error;
  return data[0];
};

export const updateSubscription = async (id: string, updates: SubscriptionUpdate) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('subscriptions').update(updates).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

export const deleteSubscription = async (id: string) => {
  const supabase = getSupabase();
  const { error } = await supabase.from('subscriptions').delete().eq('id', id);
  if (error) throw error;
  return true;
};
