// src/actions/commitment-payments.ts
"use server";

import { getSupabase } from "@/lib/supabaseClient";
import type {
  Commitment,
  CommitmentPayment,
  CommitmentPaymentInsert,
  CommitmentNotification,
} from "@/types/database";

// ─── Payment Cascade ────────────────────────────────────────────────────────
//
// recordPayment() is the heart of the commitment system.
// One payment triggers the entire cascade:
//   1. Insert payment record
//   2. Update commitment outstanding_balance
//   3. Update progress_percentage
//   4. Update months_completed / months_remaining
//   5. Update status (if completed)
//   6. Insert notification
//   7. (Future) Recalculate health score + trigger AI re-evaluation
// ─────────────────────────────────────────────────────────────────────────────

export interface PaymentResult {
  payment: CommitmentPayment;
  commitment: Commitment;
  notification: CommitmentNotification | null;
  statusChanged: boolean;
  previousStatus: string;
  newStatus: string;
}

export async function recordPayment(
  input: CommitmentPaymentInsert
): Promise<PaymentResult> {
  const supabase = getSupabase();

  // ── Step 1: Fetch the commitment ──────────────────────────────────────────
  const { data: commitment, error: fetchErr } = await supabase
    .from("commitments")
    .select("*")
    .eq("id", input.commitment_id)
    .single();

  if (fetchErr || !commitment) {
    throw new Error(`Commitment not found: ${fetchErr?.message ?? "unknown"}`);
  }

  const prev = commitment as Commitment;
  const previousStatus = prev.status;

  // ── Step 2: Insert payment record ─────────────────────────────────────────
  const { data: paymentData, error: payErr } = await supabase
    .from("commitment_payments")
    .insert({
      commitment_id: input.commitment_id,
      user_id: input.user_id,
      amount: input.amount,
      paid_date: input.paid_date ?? new Date().toISOString(),
      payment_mode: input.payment_mode ?? null,
      notes: input.notes ?? null,
    } as any)
    .select()
    .single();

  if (payErr) throw new Error(`Payment insert failed: ${payErr.message}`);
  const payment = paymentData as CommitmentPayment;

  // ── Step 3: Calculate updated tracking fields ─────────────────────────────
  const newOutstanding = Math.max(0, prev.outstanding_balance - input.amount);
  const newMonthsCompleted = prev.months_completed + 1;
  const newMonthsRemaining = Math.max(0, prev.months_remaining - 1);
  const newProgress =
    prev.original_amount > 0
      ? Math.min(
          100,
          Math.round(
            ((prev.original_amount - newOutstanding) / prev.original_amount) *
              100
          )
        )
      : 100;

  // ── Step 4: Determine new status ──────────────────────────────────────────
  let newStatus = prev.status;
  if (newOutstanding <= 0 || newProgress >= 100) {
    newStatus = "completed";
  }

  // Calculate next due date (advance by 1 month from current due)
  let nextDue = prev.next_due_date;
  if (newStatus !== "completed" && prev.next_due_date) {
    const dueDate = new Date(prev.next_due_date);
    dueDate.setMonth(dueDate.getMonth() + 1);
    nextDue = dueDate.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  // ── Step 5: Update commitment ─────────────────────────────────────────────
  const updatePayload: Record<string, any> = {
    outstanding_balance: newOutstanding,
    progress_percentage: newProgress,
    months_completed: newMonthsCompleted,
    months_remaining: newMonthsRemaining,
    status: newStatus,
    next_due_date: newStatus === "completed" ? null : nextDue,
    updated_at: new Date().toISOString(),
  };

  const { data: updatedCommitment, error: updateErr } = await supabase
    .from("commitments")
    .update(updatePayload)
    .eq("id", input.commitment_id)
    .select()
    .single();

  if (updateErr) {
    throw new Error(`Commitment update failed: ${updateErr.message}`);
  }

  // ── Step 6: Insert notification ───────────────────────────────────────────
  const statusChanged = previousStatus !== newStatus;
  let notification: CommitmentNotification | null = null;

  // Always create a payment_recorded notification
  const notifType = statusChanged ? newStatus : "payment_recorded";
  const notifMessage = statusChanged
    ? `🎉 Your commitment "${prev.title}" is now ${newStatus}! Outstanding: ₹${newOutstanding.toLocaleString()}`
    : `✅ Payment of ₹${input.amount.toLocaleString()} recorded for "${prev.title}". Outstanding: ₹${newOutstanding.toLocaleString()} (${newProgress}% complete)`;

  const { data: notifData, error: notifErr } = await supabase
    .from("commitment_notifications")
    .insert({
      commitment_id: input.commitment_id,
      user_id: input.user_id,
      type: notifType,
      message: notifMessage,
      is_read: false,
    } as any)
    .select()
    .single();

  if (!notifErr && notifData) {
    notification = notifData as CommitmentNotification;
  }

  // ── Step 7: (Future) Health score recalculation + AI re-evaluation ────────
  // TODO: recalculateHealthScore(input.user_id)
  // TODO: triggerAIRevaluation(input.commitment_id)

  return {
    payment,
    commitment: updatedCommitment as Commitment,
    notification,
    statusChanged,
    previousStatus,
    newStatus,
  };
}

// ─── Fetch Payment History ──────────────────────────────────────────────────

export async function fetchPaymentHistory(
  commitmentId: string
): Promise<CommitmentPayment[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("commitment_payments")
    .select("*")
    .eq("commitment_id", commitmentId)
    .order("paid_date", { ascending: false });

  if (error) throw new Error(`Payment history fetch failed: ${error.message}`);
  return data as CommitmentPayment[];
}

// ─── Fetch All Payments for User ────────────────────────────────────────────

export async function fetchUserPayments(
  userId: string,
  limit = 20
): Promise<CommitmentPayment[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("commitment_payments")
    .select("*")
    .eq("user_id", userId)
    .order("paid_date", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`User payments fetch failed: ${error.message}`);
  return data as CommitmentPayment[];
}

// ─── Payment Summary ────────────────────────────────────────────────────────

export interface PaymentSummary {
  totalPaid: number;
  paymentCount: number;
  lastPaymentDate: string | null;
  avgPaymentAmount: number;
}

export async function fetchPaymentSummary(
  commitmentId: string
): Promise<PaymentSummary> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("commitment_payments")
    .select("amount, paid_date")
    .eq("commitment_id", commitmentId)
    .order("paid_date", { ascending: false });

  if (error) throw new Error(`Payment summary failed: ${error.message}`);

  const payments = data as Pick<CommitmentPayment, "amount" | "paid_date">[];
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const paymentCount = payments.length;
  const lastPaymentDate = payments.length > 0 ? payments[0].paid_date : null;
  const avgPaymentAmount = paymentCount > 0 ? totalPaid / paymentCount : 0;

  return { totalPaid, paymentCount, lastPaymentDate, avgPaymentAmount };
}
