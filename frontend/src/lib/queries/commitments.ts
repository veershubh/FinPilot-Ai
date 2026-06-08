// src/lib/queries/commitments.ts

import { getSupabase } from "@/lib/supabaseClient";
import type {
  Commitment,
  CommitmentInsert,
  CommitmentUpdate,
  CommitmentPayment,
  CommitmentAIInsight,
  CommitmentNotification,
} from "@/types/database";

// ─── Commitments ────────────────────────────────────────────────────────────

/** Fetch all commitments for a user */
export async function getCommitments(
  userId: string,
  filters?: { status?: string[]; category?: string[] }
): Promise<Commitment[]> {
  const supabase = getSupabase();
  let query = supabase.from("commitments").select("*").eq("user_id", userId);

  if (filters?.status && filters.status.length > 0) {
    query = query.in("status", filters.status as any);
  }
  if (filters?.category && filters.category.length > 0) {
    query = query.in("category", filters.category as any);
  }

  const { data, error } = await query.order("next_due_date", {
    ascending: true,
  });

  if (error) {
    console.error("Error fetching commitments", error);
    return [];
  }
  return data as Commitment[];
}

/** Fetch a single commitment by ID */
export async function getCommitmentById(
  id: string
): Promise<Commitment | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("commitments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching commitment", error);
    return null;
  }
  return data as Commitment;
}

/** Insert a new commitment */
export async function addCommitment(
  insert: CommitmentInsert
): Promise<Commitment | null> {
  const supabase = getSupabase();

  // Calculate tracking fields
  const startDate = new Date(insert.start_date);
  const endDate = insert.end_date ? new Date(insert.end_date) : null;
  const totalMonths = endDate
    ? Math.max(
        0,
        Math.round(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        )
      )
    : 0;

  const payload = {
    ...insert,
    outstanding_balance: insert.original_amount ?? 0,
    progress_percentage: 0,
    months_completed: 0,
    months_remaining: totalMonths,
    next_due_date: insert.start_date,
    status: "active",
  };

  const { data, error } = await supabase
    .from("commitments")
    .insert(payload as any)
    .select()
    .single();

  if (error) {
    console.error("Error adding commitment", error);
    return null;
  }
  return data as Commitment;
}

/** Update a commitment by ID */
export async function updateCommitment(
  id: string,
  update: CommitmentUpdate
): Promise<Commitment | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("commitments")
    .update({ ...update, updated_at: new Date().toISOString() } as any)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating commitment", error);
    return null;
  }
  return data as Commitment;
}

/** Delete a commitment by ID */
export async function deleteCommitment(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from("commitments").delete().eq("id", id);
  if (error) {
    console.error("Error deleting commitment", error);
    return false;
  }
  return true;
}

// ─── Payments ───────────────────────────────────────────────────────────────

/** Fetch payments for a commitment */
export async function getCommitmentPayments(
  commitmentId: string
): Promise<CommitmentPayment[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("commitment_payments")
    .select("*")
    .eq("commitment_id", commitmentId)
    .order("paid_date", { ascending: false });

  if (error) {
    console.error("Error fetching payments", error);
    return [];
  }
  return data as CommitmentPayment[];
}

// ─── AI Insights ────────────────────────────────────────────────────────────

/** Fetch AI insights for a commitment */
export async function getCommitmentInsights(
  commitmentId: string
): Promise<CommitmentAIInsight[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("commitment_ai_insights")
    .select("*")
    .eq("commitment_id", commitmentId)
    .order("generated_at", { ascending: false });

  if (error) {
    console.error("Error fetching AI insights", error);
    return [];
  }
  return data as CommitmentAIInsight[];
}

// ─── Notifications ──────────────────────────────────────────────────────────

/** Fetch unread notifications for a user */
export async function getUnreadNotifications(
  userId: string,
  limit = 10
): Promise<CommitmentNotification[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("commitment_notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching notifications", error);
    return [];
  }
  return data as CommitmentNotification[];
}

/** Mark notification as read */
export async function markNotificationRead(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("commitment_notifications")
    .update({ is_read: true } as any)
    .eq("id", id);
  if (error) {
    console.error("Error marking notification read", error);
    return false;
  }
  return true;
}

// ─── Aggregate Summary ──────────────────────────────────────────────────────

export interface CommitmentsSummary {
  totalMonthlyBurden: number;
  totalOutstanding: number;
  activeCount: number;
  upcomingCount: number;
  completedCount: number;
  overdueCount: number;
  avgProgress: number;
  categoryBreakdown: Record<string, { count: number; monthly: number }>;
}

/** Aggregate summary for dashboard widgets */
export async function getCommitmentsSummary(
  userId: string
): Promise<CommitmentsSummary> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("commitments")
    .select("monthly_amount, outstanding_balance, status, category, progress_percentage")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching summary", error);
    return {
      totalMonthlyBurden: 0,
      totalOutstanding: 0,
      activeCount: 0,
      upcomingCount: 0,
      completedCount: 0,
      overdueCount: 0,
      avgProgress: 0,
      categoryBreakdown: {},
    };
  }

  const items = data as Pick<
    Commitment,
    "monthly_amount" | "outstanding_balance" | "status" | "category" | "progress_percentage"
  >[];

  const totalMonthlyBurden = items.reduce(
    (sum, i) => sum + (i.monthly_amount ?? 0),
    0
  );
  const totalOutstanding = items.reduce(
    (sum, i) => sum + (i.outstanding_balance ?? 0),
    0
  );
  const activeCount = items.filter((i) => i.status === "active").length;
  const upcomingCount = items.filter((i) => i.status === "upcoming").length;
  const completedCount = items.filter((i) => i.status === "completed").length;
  const overdueCount = items.filter((i) => i.status === "overdue").length;
  const avgProgress =
    items.length > 0
      ? Math.round(
          items.reduce((sum, i) => sum + (i.progress_percentage ?? 0), 0) /
            items.length
        )
      : 0;

  const categoryBreakdown: Record<string, { count: number; monthly: number }> =
    {};
  items.forEach((i) => {
    const cat = i.category;
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = { count: 0, monthly: 0 };
    }
    categoryBreakdown[cat].count += 1;
    categoryBreakdown[cat].monthly += i.monthly_amount ?? 0;
  });

  return {
    totalMonthlyBurden,
    totalOutstanding,
    activeCount,
    upcomingCount,
    completedCount,
    overdueCount,
    avgProgress,
    categoryBreakdown,
  };
}
