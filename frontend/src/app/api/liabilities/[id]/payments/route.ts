// src/app/api/liabilities/[id]/payments/route.ts
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/utils/supabase/server";

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

    // Insert payment record
    const { data: payment, error: paymentError } = await supabase
      .from("liability_payments")
      .insert({
        liability_id: liabilityId,
        user_id: user.id,
        amount,
        payment_date: payment_date || new Date().toISOString().split("T")[0],
        payment_type,
        notes: notes || null,
      })
      .select()
      .single();

    if (paymentError) return NextResponse.json({ error: paymentError.message }, { status: 500 });

    // Reduce outstanding balance on the liability
    const { data: liability } = await supabase
      .from("liabilities")
      .select("outstanding_balance")
      .eq("id", liabilityId)
      .eq("user_id", user.id)
      .single();

    if (liability) {
      const newBalance = Math.max(0, (liability.outstanding_balance ?? 0) - amount);
      const updatePayload: any = {
        outstanding_balance: newBalance,
        updated_at: new Date().toISOString(),
      };

      // If balance reaches 0, mark as paid_off
      if (newBalance <= 0) {
        updatePayload.status = "paid_off";
      }

      await supabase
        .from("liabilities")
        .update(updatePayload)
        .eq("id", liabilityId)
        .eq("user_id", user.id);
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (e: any) {
    console.error("[api/liabilities/payments] POST error:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
