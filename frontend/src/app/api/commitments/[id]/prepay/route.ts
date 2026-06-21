// src/app/api/commitments/[id]/prepay/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";
import { calculateProgress } from "@/lib/finance-records";
import type { Commitment } from "@/types/database";

/**
 * POST /api/commitments/[id]/prepay
 *
 * Record a principal prepayment — reduces outstanding balance,
 * calculates interest saved and months reduced, then updates the commitment.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getRouteHandlerSupabase(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { id: commitmentId } = await params;
  const body = await request.json();
  const { amount } = body as { amount: number };

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
  }

  // ── 1. Fetch commitment ────────────────────────────────────────────────
  const { data: commitment, error: fetchErr } = await supabase
    .from("commitments")
    .select("*")
    .eq("id", commitmentId)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !commitment) {
    return NextResponse.json({ error: "Commitment not found" }, { status: 404 });
  }

  const prev = commitment as Commitment;

  if (amount > prev.outstanding_balance) {
    return NextResponse.json(
      { error: `Prepayment (₹${amount}) exceeds outstanding balance (₹${prev.outstanding_balance})` },
      { status: 400 }
    );
  }

  // ── 2. Calculate savings ───────────────────────────────────────────────
  const monthlyRate = (prev.interest_rate ?? 0) / 100 / 12;
  const newOutstanding = Math.max(0, prev.outstanding_balance - amount);

  // Interest saved: for the remaining tenure, the interest on the prepaid principal
  const remainingMonths = prev.months_remaining ?? 0;
  let interestSaved = 0;
  if (monthlyRate > 0 && remainingMonths > 0) {
    // Simple calculation: interest that would have been paid on the prepaid amount
    interestSaved = Math.round(amount * monthlyRate * remainingMonths);
  }

  // New tenure: how many months to pay off newOutstanding at current EMI
  let newTenureMonths = remainingMonths;
  let monthsReduced = 0;
  if (prev.monthly_amount > 0 && newOutstanding > 0) {
    if (monthlyRate > 0) {
      // EMI formula inverted: n = -ln(1 - P*r/EMI) / ln(1+r)
      const ratio = 1 - (newOutstanding * monthlyRate) / prev.monthly_amount;
      if (ratio > 0) {
        newTenureMonths = Math.ceil(-Math.log(ratio) / Math.log(1 + monthlyRate));
      } else {
        newTenureMonths = Math.ceil(newOutstanding / prev.monthly_amount);
      }
    } else {
      newTenureMonths = Math.ceil(newOutstanding / prev.monthly_amount);
    }
    monthsReduced = Math.max(0, remainingMonths - newTenureMonths);
  } else if (newOutstanding <= 0) {
    newTenureMonths = 0;
    monthsReduced = remainingMonths;
  }

  // New progress
  const newProgress = calculateProgress(prev.original_amount, newOutstanding);

  // New status
  let newStatus = prev.status;
  if (newOutstanding <= 0 || newProgress >= 100) {
    newStatus = "completed";
  }

  // New closure date
  let newClosureDate: string | null = null;
  if (newTenureMonths > 0 && newStatus !== "completed") {
    const closure = new Date();
    closure.setMonth(closure.getMonth() + newTenureMonths);
    newClosureDate = closure.toISOString().split("T")[0];
  }

  // ── 3. Insert prepayment record ────────────────────────────────────────
  const { data: prepayment, error: insertErr } = await supabase
    .from("commitment_prepayments")
    .insert({
      commitment_id: commitmentId,
      user_id: user.id,
      amount,
      interest_saved: interestSaved,
      months_reduced: monthsReduced,
      new_outstanding: newOutstanding,
      new_tenure_months: newTenureMonths,
    } as any)
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // ── 4. Update commitment ───────────────────────────────────────────────
  const { data: updated, error: updateErr } = await supabase
    .from("commitments")
    .update({
      outstanding_balance: newOutstanding,
      months_remaining: newTenureMonths,
      progress_percentage: newProgress,
      status: newStatus,
      end_date: newClosureDate ?? prev.end_date,
      next_due_date: newStatus === "completed" ? null : prev.next_due_date,
      updated_at: new Date().toISOString(),
    } as any)
    .eq("id", commitmentId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // ── 5. Create notification ─────────────────────────────────────────────
  await supabase.from("commitment_notifications").insert({
    commitment_id: commitmentId,
    user_id: user.id,
    type: newStatus === "completed" ? "completed" : "payment_recorded",
    message: newStatus === "completed"
      ? `🎉 ${prev.title} — Closed Early! You saved ₹${interestSaved.toLocaleString("en-IN")} in interest.`
      : `💰 Prepayment of ₹${amount.toLocaleString("en-IN")} on "${prev.title}". You save ₹${interestSaved.toLocaleString("en-IN")} interest and finish ${monthsReduced} month${monthsReduced !== 1 ? "s" : ""} earlier.`,
    is_read: false,
  } as any);

  // ── 6. Return result ──────────────────────────────────────────────────
  return NextResponse.json({
    prepayment,
    commitment: updated as Commitment,
    summary: {
      amount,
      interestSaved,
      monthsReduced,
      newOutstanding,
      newTenureMonths,
      newClosureDate,
      statusChanged: prev.status !== newStatus,
      newStatus,
    },
  }, { status: 201 });
}
