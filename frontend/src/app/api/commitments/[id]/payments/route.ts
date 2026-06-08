// src/app/api/commitments/[id]/payments/route.ts
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseClient";
import { notifyPaymentRecorded } from "@/lib/notifications";
import type { CommitmentPayment, Commitment } from "@/types/database";

/** Extract authenticated user ID */
async function getUserId(): Promise<string | null> {
  const supabase = getSupabase();
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
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("commitment_payments")
    .select("*")
    .eq("commitment_id", id)
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
  const userId = await getUserId();
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

  const supabase = getSupabase();

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

  // Advance next due date
  let nextDue = prev.next_due_date;
  if (newStatus !== "completed" && prev.next_due_date) {
    const dueDate = new Date(prev.next_due_date);
    dueDate.setMonth(dueDate.getMonth() + 1);
    nextDue = dueDate.toISOString().split("T")[0];
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
