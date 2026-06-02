// src/lib/queries/emi_planner.ts

import { getSupabase } from '@/lib/supabaseClient';
import type { EMIPlan, EMIPlanInsert, EMIPlanUpdate } from '@/types/database';

export const fetchEmiPlans = async (userId: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('emi_planner')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data as EMIPlan[];
};

export const insertEmiPlan = async (plan: EMIPlanInsert) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('emi_planner').insert(plan).select();
  if (error) throw error;
  return data[0] as EMIPlan;
};

export const updateEmiPlan = async (id: number, updates: EMIPlanUpdate) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('emi_planner')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0] as EMIPlan;
};

export const deleteEmiPlan = async (id: number) => {
  const supabase = getSupabase();
  const { error } = await supabase.from('emi_planner').delete().eq('id', id);
  if (error) throw error;
  return true;
};
