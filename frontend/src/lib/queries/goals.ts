// src/lib/queries/goals.ts

import { getSupabase } from '@/lib/supabaseClient';
import type { Goal, GoalInsert, GoalUpdate } from '@/types/database';

/** Fetch all goals for the current user */
export const fetchGoals = async (userId: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('goals')
    .select('id, user_id, title, target_amount, current_amount, target_date, status, created_at')
    .eq('user_id', userId);
  if (error) throw error;
  return data as Goal[];
};

/** Insert a new goal */
export const insertGoal = async (goal: GoalInsert) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('goals').insert(goal).select();
  if (error) throw error;
  return data[0] as Goal;
};

/** Update an existing goal */
export const updateGoal = async (id: number, updates: GoalUpdate) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0] as Goal;
};

/** Delete a goal */
export const deleteGoal = async (id: number) => {
  const supabase = getSupabase();
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw error;
  return true;
};
