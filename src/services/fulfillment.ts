import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyUser } from "@/services/notifications";

/**
 * Grants access for every item in a paid order — course enrollment,
 * webinar registration, or event registration. Idempotent: safe to call
 * more than once for the same order (e.g. once from the client-side
 * verification call and again from the webhook as a reliability
 * backstop). Relies on unique constraints on the target tables so a
 * duplicate insert is a no-op, not an error path we have to detect
 * ourselves.
 */
export async function fulfillOrder(orderId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, status, coupon_id, order_items(item_type, item_id)")
    .eq("id", orderId)
    .single();

  if (!order) return;

  const items = order.order_items as { item_type: string; item_id: string }[];

  for (const item of items) {
    if (item.item_type === "course") {
      await admin
        .from("course_enrollments")
        .upsert(
          { student_id: order.user_id, course_id: item.item_id, source: "purchase" },
          { onConflict: "student_id,course_id", ignoreDuplicates: true },
        );
    } else if (item.item_type === "webinar") {
      await admin
        .from("webinar_registrations")
        .upsert(
          { student_id: order.user_id, webinar_id: item.item_id },
          { onConflict: "webinar_id,student_id", ignoreDuplicates: true },
        );
    } else if (item.item_type === "event") {
      await admin
        .from("event_registrations")
        .upsert(
          { student_id: order.user_id, event_id: item.item_id },
          { onConflict: "event_id,student_id", ignoreDuplicates: true },
        );
    }
  }

  // Record coupon usage exactly once (unique constraint on
  // coupon_id+order_id makes the insert itself idempotent) and only bump
  // the counter the first time it actually lands.
  if (order.coupon_id) {
    const { error: usageError } = await admin
      .from("coupon_usage")
      .insert({ coupon_id: order.coupon_id, order_id: orderId, user_id: order.user_id });

    if (!usageError) {
      const { data: coupon } = await admin
        .from("coupons")
        .select("times_used")
        .eq("id", order.coupon_id)
        .single();
      if (coupon) {
        await admin
          .from("coupons")
          .update({ times_used: coupon.times_used + 1 })
          .eq("id", order.coupon_id);
      }
    }
  }

  if (order.status !== "paid") {
    await admin.from("orders").update({ status: "paid" }).eq("id", orderId);
  }

  await notifyUser(order.user_id, {
    type: "payment_confirmed",
    title: "Payment confirmed",
    body: "Your purchase is complete and access has been granted.",
  });
}
