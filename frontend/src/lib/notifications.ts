// src/lib/notifications.ts
"use server";

import { getServerSupabase } from "@/utils/supabase/server";

export type NotificationType =
  | "payment_due"
  | "payment_recorded"
  | "payment_overdue"
  | "commitment_completed"
  | "ai_insight_generated"
  | "health_score_change";

interface CreateNotificationInput {
  userId: string;
  commitmentId: string;
  type: NotificationType;
  message: string;
}

/** Insert a notification into commitment_notifications */
export async function createNotification(input: CreateNotificationInput) {
  const supabase = await getServerSupabase();
  const { error } = await supabase.from("commitment_notifications").insert({
    user_id: input.userId,
    commitment_id: input.commitmentId,
    type: input.type,
    message: input.message,
    is_read: false,
  } as any);
  if (error) console.error("[notifications] Insert failed:", error);
}

/** Fetch unread notifications for a user */
export async function getUnreadNotifications(userId: string) {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("commitment_notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) { console.error("[notifications] Fetch failed:", error); return []; }
  return data ?? [];
}

/** Mark notifications as read */
export async function markNotificationsRead(ids: string[]) {
  const supabase = await getServerSupabase();
  const { error } = await supabase
    .from("commitment_notifications")
    .update({ is_read: true } as any)
    .in("id", ids);
  if (error) console.error("[notifications] Update failed:", error);
}

/** Helper: create payment-related notifications */
export async function notifyPaymentRecorded(
  userId: string,
  commitmentId: string,
  commitmentTitle: string,
  amount: number,
  isCompleted: boolean
) {
  await createNotification({
    userId,
    commitmentId,
    type: isCompleted ? "commitment_completed" : "payment_recorded",
    message: isCompleted
      ? `🎉 ${commitmentTitle} — Completed! Congratulations, you've fully paid it off.`
      : `✅ Payment Recorded — ₹${amount.toLocaleString("en-IN")} paid towards "${commitmentTitle}".`,
  });
}

/** Helper: create overdue notification */
export async function notifyPaymentOverdue(
  userId: string,
  commitmentId: string,
  commitmentTitle: string,
  dueDate: string
) {
  await createNotification({
    userId,
    commitmentId,
    type: "payment_overdue",
    message: `⚠️ Overdue: ${commitmentTitle} — Payment was due on ${new Date(dueDate).toLocaleDateString("en-IN")}. Please pay soon to avoid penalties.`,
  });
}
