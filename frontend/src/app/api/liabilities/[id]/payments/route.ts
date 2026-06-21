// src/app/api/liabilities/[id]/payments/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";
import { addMonths } from "@/lib/finance-records";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const liabilityId = params.id;

    const supabase = getRouteHandlerSupabase(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { data, error } = await supabase
      .from("liability_payments")
      .select("*")
      .eq("liability_id", liabilityId)
      .eq("user_id", user.id)
      .order("payment_date", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const liabilityId = params.id;

    const supabase = getRouteHandlerSupabase(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const body = await request.json();
    const { amount, payment_type = "emi", payment_date, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Amount must be positive" }, { status: 400 });
    }

    const { data: liability, error: liabilityError } = await supabase
      .from("liabilities")
      .select("outstanding_balance, next_due_date, status")
      .eq("id", liabilityId)
      .eq("user_id", user.id)
      .single();

    if (liabilityError || !liability) {
      return NextResponse.json({ error: "Liability not found" }, { status: 404 });
    }

    const paymentDate = payment_date || new Date().toISOString().split("T")[0];
    const newBalance = Math.max(0, (liability.outstanding_balance ?? 0) - amount);
    const updatePayload: any = {
      outstanding_balance: newBalance,
      updated_at: new Date().toISOString(),
      status: newBalance <= 0 ? "paid_off" : liability.status,
      next_due_date: newBalance <= 0 ? null : liability.next_due_date ? addMonths(liability.next_due_date, 1) : null,
    };

    // Insert payment record
    const { data: payment, error: paymentError } = await supabase
      .from("liability_payments")
      .insert({
        liability_id: liabilityId,
        user_id: user.id,
        amount,
        payment_date: paymentDate,
        payment_type,
        notes: notes || null,
      })
      .select()
      .single();

    if (paymentError) return NextResponse.json({ error: paymentError.message }, { status: 500 });

    const { data: updatedLiability, error: updateError } = await supabase
      .from("liabilities")
      .update(updatePayload)
      .eq("id", liabilityId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    await supabase.from("liability_history").insert({
      liability_id: liabilityId,
      user_id: user.id,
      recorded_date: paymentDate,
      outstanding_balance: newBalance,
    } as any);

    return NextResponse.json({ payment, liability: updatedLiability }, { status: 201 });
  } catch (e: any) {
    console.error("[api/liabilities/payments] POST error:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
