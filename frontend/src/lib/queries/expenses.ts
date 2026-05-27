import { getSupabase } from '@/lib/supabaseClient';
import type { Expense, ExpenseInsert, ExpenseUpdate } from '@/types/database';

/** Fetch all expenses for the current user */
export async function getExpenses(): Promise<Expense[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false });
  if (error) {
    console.error('Error fetching expenses', error);
    return [];
  }
  return data as Expense[];
}

/** Insert a new expense */
export async function addExpense(insert: ExpenseInsert): Promise<Expense | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('expenses').insert(insert).select().single();
  if (error) {
    console.error('Error adding expense', error);
    return null;
  }
  return data as Expense;
}

/** Update an expense by ID */
export async function updateExpense(id: string, update: ExpenseUpdate): Promise<Expense | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('expenses')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('Error updating expense', error);
    return null;
  }
  return data as Expense;
}

/** Delete an expense by ID */
export async function deleteExpense(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) {
    console.error('Error deleting expense', error);
    return false;
  }
  return true;
}
