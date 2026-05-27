// src/lib/queries/budgets.ts

import { getSupabase } from '@/lib/supabaseClient';
import type { Budget, BudgetInsert, BudgetUpdate } from '@/types/database';

export const fetchBudgets = async (userId: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data as Budget[];
};

export const insertBudget = async (budget: BudgetInsert) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('budgets').insert(budget).select();
  if (error) throw error;
  return data[0] as Budget;
};

export const updateBudget = async (id: number, updates: BudgetUpdate) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0] as Budget;
};

export const deleteBudget = async (id: number) => {
  const supabase = getSupabase();
  const { error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) throw error;
  return true;
};
