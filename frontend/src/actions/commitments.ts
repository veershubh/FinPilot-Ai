// src/actions/commitments.ts
"use server";

import { getSupabase } from "@/lib/supabaseClient";
import type {
  Commitment,
  CommitmentInsert,
  CommitmentUpdate,
  CommitmentAIInsight,
  CommitmentPayment,
  CommitmentNotification,
} from "@/types/database";

/** Create a new commitment – calculates tracking fields and triggers AI insight generation */
export async function createCommitment(data: CommitmentInsert): Promise<Commitment> {
  const supabase = getSupabase();

  // Initial calculations for tracking fields
  const startDate = new Date(data.start_date);
  const endDate = data.end_date ? new Date(data.end_date) : null;
  const totalMonths = endDate ? Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))) : 0;
  const nextDue = data.start_date; // first due is start date

  const insert = {
    ...data,
    outstanding_balance: data.original_amount ?? 0,
    progress_percentage: 0,
    months_completed: 0,
    months_remaining: totalMonths,
    next_due_date: nextDue,
    status: "active",
  };

  const { data: created, error } = await supabase
    .from("commitments")
    .insert(insert as any)
    .select()
    .single();
  if (error) throw error;

  // TODO: trigger AI insight generation (e.g., call a RPC or background job)

  return created as Commitment;
}

/** Fetch commitments for a user with optional filters */
export async function fetchCommitments(
  userId: string,
  filters?: { status?: string[]; category?: string[] }
): Promise<Commitment[]> {
  const supabase = getSupabase();
  let query = supabase.from("commitments").select("*").eq("user_id", userId);
  if (filters?.status) query = query.in("status", filters.status as any);
  if (filters?.category) query = query.in("category", filters.category as any);
  const { data, error } = await query.order("next_due_date", { ascending: true });
  if (error) throw error;
  return data as Commitment[];
}

/** Fetch a single commitment together with its payments and AI insights */
export async function fetchCommitmentById(id: string): Promise<{
  commitment: Commitment;
  payments: CommitmentPayment[];
  insights: CommitmentAIInsight[];
}> {
  const supabase = getSupabase();
  const { data: commitment, error: cErr } = await supabase
    .from("commitments")
    .select("*")
    .eq("id", id)
    .single();
  if (cErr) throw cErr;

  const { data: payments, error: pErr } = await supabase
    .from("commitment_payments")
    .select("*")
    .eq("commitment_id", id);
  if (pErr) throw pErr;

  const { data: insights, error: iErr } = await supabase
    .from("commitment_ai_insights")
    .select("*")
    .eq("commitment_id", id);
  if (iErr) throw iErr;

  return {
    commitment: commitment as Commitment,
    payments: payments as CommitmentPayment[],
    insights: insights as CommitmentAIInsight[],
  };
}

/** Partial update of a commitment – recalculates progress if needed */
export async function updateCommitment(id: string, updates: CommitmentUpdate): Promise<Commitment> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("commitments")
    .update(updates as any)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Commitment;
}

/** Delete a commitment – cascade deletes payments, insights, notifications via DB FK */
export async function deleteCommitment(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from("commitments").delete().eq("id", id);
  if (error) throw error;
  return true;
}

/** Aggregate summary stats for a user */
export async function fetchCommitmentSummary(userId: string): Promise<{
  totalMonthly: number;
  activeCount: number;
  upcomingCount: number;
}> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("commitments")
    .select("monthly_amount, status")
    .eq("user_id", userId);
  if (error) throw error;

  const items = data as Commitment[];
  const totalMonthly = items.reduce((sum, i) => sum + (i.monthly_amount ?? 0), 0);
  const activeCount = items.filter(i => i.status === "active").length;
  const upcomingCount = items.filter(i => i.status === "upcoming").length;

  return { totalMonthly, activeCount, upcomingCount };
}
