// src/lib/queries/transactions.ts

import { getSupabase } from '@/lib/supabaseClient';
import type { Transaction, TransactionInsert, TransactionUpdate } from '@/types/database';

/** Fetch all transactions for a user */
export const fetchTransactions = async (userId: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('transactions')
    .select('id, user_id, title, type, amount, notes, category, transaction_date, created_at')
    .eq('user_id', userId);
  if (error) throw error;
  return data as Transaction[];
};

/** Insert a new transaction */
export const insertTransaction = async (tx: TransactionInsert) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('transactions').insert(tx).select();
  if (error) throw error;
  return data[0] as Transaction;
};

/** Update a transaction */
export const updateTransaction = async (id: number, updates: TransactionUpdate) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0] as Transaction;
};

/** Delete a transaction */
export const deleteTransaction = async (id: number) => {
  const supabase = getSupabase();
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
  return true;
};
