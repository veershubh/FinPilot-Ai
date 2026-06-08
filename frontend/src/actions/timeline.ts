// src/actions/timeline.ts
/**
 * Server actions for the Financial Timeline feature.
 * All functions are async and use the Supabase client.
 */

"use server";

import { getSupabase } from "@/lib/supabaseClient";
import type { FinancialTimeline, FinancialTimelineInsert, FinancialTimelineUpdate } from "@/types/database";

/** Fetch all timeline items for a given user */
export async function fetchTimeline(userId: string): Promise<FinancialTimeline[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("financial_timeline")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: true });
  if (error) throw error;
  return data as FinancialTimeline[];
}

/** Add a new commitment to the timeline */
export async function addToTimeline(item: FinancialTimelineInsert): Promise<FinancialTimeline> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("financial_timeline").insert(item).select();
  if (error) throw error;
  return (data as FinancialTimeline[])[0];
}

/** Update an existing timeline item */
export async function updateTimelineItem(
  id: string,
  updates: FinancialTimelineUpdate,
): Promise<FinancialTimeline> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("financial_timeline")
    .update(updates)
    .eq("id", id)
    .select();
  if (error) throw error;
  return (data as FinancialTimeline[])[0];
}

/** Delete a timeline item */
export async function deleteTimelineItem(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from("financial_timeline").delete().eq("id", id);
  if (error) throw error;
  return true;
}

/**
 * Fetch aggregated summary for the timeline – total monthly burden and category breakdown.
 */
export interface TimelineSummary {
  totalMonthly: number;
  categoryBreakdown: Record<string, number>;
}

export async function fetchTimelineSummary(userId: string): Promise<TimelineSummary> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("financial_timeline")
    .select("monthly_amount, category")
    .eq("user_id", userId);
  if (error) throw error;

  const items = data as FinancialTimeline[];
  const totalMonthly = items.reduce((sum, i) => sum + (i.monthly_amount ?? 0), 0);
  const categoryBreakdown: Record<string, number> = {};
  items.forEach((i) => {
    const cat = i.category;
    categoryBreakdown[cat] = (categoryBreakdown[cat] ?? 0) + (i.monthly_amount ?? 0);
  });
  return { totalMonthly, categoryBreakdown };
}
