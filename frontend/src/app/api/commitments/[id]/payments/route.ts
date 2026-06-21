// src/app/api/commitments/[id]/payments/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";
import { notifyPaymentRecorded } from "@/lib/notifications";
import { addMonths, calculateProgress } from "@/lib/finance-records";
import type { CommitmentPayment, Commitment } from "@/types/database";

/** Extract authenticated user ID */
async function getUserId(request: Request): Promise<string | null> {
  const supabase = getRouteHandlerSupabase(request);
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user?.id ?? null;
}

/**
 * GET /api/commitments/[id]/payments
 *
 * Returns payment history for a commitment.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getRouteHandlerSupabase(request);

  const { data, error } = await supabase
    .from("commitment_payments")
    .select("*")
    .eq("commitment_id", id)
    .eq("user_id", userId)
    .order("paid_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data as CommitmentPayment[]);
}

/**
 * POST /api/commitments/[id]/payments
 *
 * Record a payment — triggers the cascade:
 *   insert payment → update balance → update progress → update status → insert notification
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { id: commitmentId } = await params;
  const body = await request.json();
  const { amount, payment_mode, notes } = body as {
    amount: number;
    payment_mode?: string;
    notes?: string;
  };

  if (!amount || amount <= 0) {
    return NextResponse.json(
      { error: "Amount must be greater than 0" },
      { status: 400 }
    );
  }

  const supabase = getRouteHandlerSupabase(request);

  // ── Step 1: Fetch commitment ──────────────────────────────────────────────
  const { data: commitment, error: fetchErr } = await supabase
    .from("commitments")
    .select("*")
    .eq("id", commitmentId)
    .eq("user_id", userId)
    .single();

  if (fetchErr || !commitment) {
    return NextResponse.json(
      { error: "Commitment not found" },
      { status: 404 }
    );
  }

  const prev = commitment as Commitment;

  // ── Step 2: Insert payment ────────────────────────────────────────────────
  const { data: paymentData, error: payErr } = await supabase
    .from("commitment_payments")
    .insert({
      commitment_id: commitmentId,
      user_id: userId,
      amount,
      paid_date: new Date().toISOString(),
      payment_mode: payment_mode ?? null,
      notes: notes ?? null,
    } as any)
    .select()
    .single();

  if (payErr) {
    return NextResponse.json({ error: payErr.message }, { status: 500 });
  }

  // ── Step 3: Calculate updated tracking fields ─────────────────────────────
  const newOutstanding = Math.max(0, prev.outstanding_balance - amount);
  const newMonthsCompleted = prev.months_completed + 1;
  const newMonthsRemaining = Math.max(0, prev.months_remaining - 1);
  const newProgress = calculateProgress(prev.original_amount, newOutstanding);

  // ── Step 4: Determine new status ──────────────────────────────────────────
  let newStatus = prev.status;
  if (newOutstanding <= 0 || newProgress >= 100) {
    newStatus = "completed";
  }

  // Advance next due date
  let nextDue = prev.next_due_date;
  if (newStatus !== "completed" && prev.next_due_date) {
    nextDue = addMonths(prev.next_due_date, 1);
  }

  // ── Step 5: Update commitment ─────────────────────────────────────────────
  const { data: updatedCommitment, error: updateErr } = await supabase
    .from("commitments")
    .update({
      outstanding_balance: newOutstanding,
      progress_percentage: newProgress,
      months_completed: newMonthsCompleted,
      months_remaining: newMonthsRemaining,
      status: newStatus,
      next_due_date: newStatus === "completed" ? null : nextDue,
      updated_at: new Date().toISOString(),
    } as any)
    .eq("id", commitmentId)
    .eq("user_id", userId)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // ── Step 6: Notify ───────────────────────────────────────────────────────
  notifyPaymentRecorded(userId, commitmentId, prev.title, amount, newStatus === "completed")
    .catch(e => console.warn("[payments] Notification failed:", e));

  return NextResponse.json(
    {
      payment: paymentData as CommitmentPayment,
      commitment: updatedCommitment as Commitment,
      statusChanged: prev.status !== newStatus,
      newStatus,
    },
    { status: 201 }
  );
}
