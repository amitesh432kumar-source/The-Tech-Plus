import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface MyNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: string;
}

export async function listMyNotifications(userId: string): Promise<MyNotification[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, is_read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    isRead: n.is_read,
    createdAt: n.created_at,
  }));
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  return count ?? 0;
}

/**
 * Creates a notification for a user. Uses the service-role client since
 * notifications are system-generated (enrollment, payment, certificate,
 * reminders) rather than something a client should insert directly —
 * there's no client-side insert policy on this table by design.
 */
export async function notifyUser(
  userId: string,
  notification: { type: string; title: string; body?: string },
): Promise<void> {
  const admin = createAdminClient();
  await admin.from("notifications").insert({
    user_id: userId,
    type: notification.type,
    title: notification.title,
    body: notification.body,
  });
}
