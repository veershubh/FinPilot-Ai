// src/lib/queries/emi_planner.ts

import { getSupabase } from '@/lib/supabaseClient';
import type { EmiPlanner, EmiPlannerInsert, EmiPlannerUpdate } from '@/types/database';

export const getSupabase = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export const fetchEmiPlans = async (userId: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('emi_planner')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data as EmiPlanner[];
};

export const insertEmiPlan = async (plan: EmiPlannerInsert) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('emi_planner').insert(plan).select();
  if (error) throw error;
  return data[0] as EmiPlanner;
};

export const updateEmiPlan = async (id: number, updates: EmiPlannerUpdate) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('emi_planner')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0] as EmiPlanner;
};

export const deleteEmiPlan = async (id: number) => {
  const supabase = getSupabase();
  const { error } = await supabase.from('emi_planner').delete().eq('id', id);
  if (error) throw error;
  return true;
};
