// src/app/api/commitments/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";
import type {
  Commitment,
  CommitmentPayment,
  CommitmentAIInsight,
  CommitmentUpdate,
} from "@/types/database";

/** Extract authenticated user ID */
async function getUserId(): Promise<string | null> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user?.id ?? null;
}

/**
 * GET /api/commitments/[id]
 *
 * Returns commitment detail with payments and AI insights joined.
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
  const supabase = await getServerSupabase();

  // Parallel fetch: commitment + payments + insights
  const [commitmentRes, paymentsRes, insightsRes] = await Promise.all([
    supabase.from("commitments").select("*").eq("id", id).single(),
    supabase
      .from("commitment_payments")
      .select("*")
      .eq("commitment_id", id)
      .order("paid_date", { ascending: false }),
    supabase
      .from("commitment_ai_insights")
      .select("*")
      .eq("commitment_id", id)
      .order("generated_at", { ascending: false }),
  ]);

  if (commitmentRes.error) {
    return NextResponse.json(
      { error: commitmentRes.error.message },
      { status: 404 }
    );
  }

  return NextResponse.json({
    commitment: commitmentRes.data as Commitment,
    payments: (paymentsRes.data ?? []) as CommitmentPayment[],
    insights: (insightsRes.data ?? []) as CommitmentAIInsight[],
  });
}

/**
 * PUT /api/commitments/[id]
 *
 * Partial update of a commitment.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  const updates: CommitmentUpdate = await request.json();
  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from("commitments")
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data as Commitment);
}

/**
 * DELETE /api/commitments/[id]
 *
 * Cascade-deletes the commitment (FK on delete cascade handles children).
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await getServerSupabase();

  const { error } = await supabase
    .from("commitments")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
