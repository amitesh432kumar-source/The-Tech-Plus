"use server";

import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPaypalOrder, capturePaypalOrder, isPaypalConfigured } from "@/lib/paypal/client";
import { validateCoupon } from "@/features/payments/coupon";
import { fulfillOrder } from "@/services/fulfillment";
import type { Json } from "@/types/database";

export type PurchasableType = "course" | "webinar" | "event";

const CURRENCY = process.env.PAYPAL_CURRENCY || "USD";

export interface CreateOrderState {
  error?: string;
  freeEnrollment?: boolean;
  checkout?: {
    orderId: string;
    paypalOrderId: string;
    clientId: string;
    currency: string;
    itemTitle: string;
  };
}

async function getItemPriceAndTitle(itemType: PurchasableType, itemId: string) {
  const supabase = await createClient();

  if (itemType === "course") {
    const { data } = await supabase
      .from("courses")
      .select("price, title")
      .eq("id", itemId)
      .eq("status", "published")
      .single();
    return data ? { price: data.price, title: data.title } : null;
  }

  if (itemType === "webinar") {
    const { data } = await supabase
      .from("webinars")
      .select("price, title")
      .eq("id", itemId)
      .neq("status", "draft")
      .single();
    return data ? { price: data.price, title: data.title } : null;
  }

  const { data } = await supabase
    .from("events")
    .select("price, title")
    .eq("id", itemId)
    .neq("status", "draft")
    .single();
  return data ? { price: data.price, title: data.title } : null;
}

async function alreadyHasAccess(itemType: PurchasableType, itemId: string, userId: string) {
  const supabase = await createClient();

  if (itemType === "course") {
    const { data } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("course_id", itemId)
      .eq("student_id", userId)
      .maybeSingle();
    return !!data;
  }

  if (itemType === "webinar") {
    const { data } = await supabase
      .from("webinar_registrations")
      .select("id")
      .eq("webinar_id", itemId)
      .eq("student_id", userId)
      .maybeSingle();
    return !!data;
  }

  const { data } = await supabase
    .from("event_registrations")
    .select("id")
    .eq("event_id", itemId)
    .eq("student_id", userId)
    .maybeSingle();
  return !!data;
}

export async function createOrderAction(
  itemType: PurchasableType,
  itemId: string,
  couponCode: string | undefined,
): Promise<CreateOrderState> {
  const user = await requireUser();

  const item = await getItemPriceAndTitle(itemType, itemId);
  if (!item) return { error: "This item is no longer available." };

  if (await alreadyHasAccess(itemType, itemId, user.id)) {
    return { error: "You already have access to this." };
  }

  let discount = 0;
  let couponId: string | undefined;

  if (couponCode) {
    const result = await validateCoupon(couponCode, item.price);
    if (!result.valid) return { error: result.error };
    discount = result.discountAmount ?? 0;
    couponId = result.couponId;
  }

  const total = Math.max(0, item.price - discount);

  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      subtotal: item.price,
      discount,
      total,
      coupon_id: couponId ?? null,
    })
    .select("id")
    .single();

  if (orderError || !order) return { error: "Could not start checkout. Please try again." };

  await admin.from("order_items").insert({
    order_id: order.id,
    item_type: itemType,
    item_id: itemId,
    title_snapshot: item.title,
    price_snapshot: item.price,
  });

  // Free after discount (or free item) — skip PayPal entirely.
  if (total <= 0) {
    await admin.from("orders").update({ status: "paid" }).eq("id", order.id);
    await fulfillOrder(order.id);
    return { freeEnrollment: true };
  }

  if (!isPaypalConfigured() || !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    return { error: "Payments aren't configured yet. Please check back soon." };
  }

  try {
    const ppOrder = await createPaypalOrder({
      internalOrderId: order.id,
      amount: total.toFixed(2),
      currency: CURRENCY,
      itemTitle: item.title,
    });

    await admin.from("orders").update({ provider_order_id: ppOrder.id }).eq("id", order.id);

    return {
      checkout: {
        orderId: order.id,
        paypalOrderId: ppOrder.id,
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        currency: CURRENCY,
        itemTitle: item.title,
      },
    };
  } catch {
    return { error: "Could not start payment. Please try again." };
  }
}

export interface CaptureState {
  error?: string;
  success?: boolean;
}

export async function capturePaymentAction(
  orderId: string,
  paypalOrderId: string,
): Promise<CaptureState> {
  const user = await requireUser();

  if (!isPaypalConfigured()) {
    return { error: "Payments aren't configured." };
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, provider_order_id, total")
    .eq("id", orderId)
    .single();

  if (!order || order.user_id !== user.id || order.provider_order_id !== paypalOrderId) {
    return { error: "Order mismatch — please contact support." };
  }

  const capture = await capturePaypalOrder(paypalOrderId);

  if (!capture.ok || capture.data.status !== "COMPLETED") {
    return { error: "Payment could not be confirmed. Please contact support." };
  }

  const captureRecord = capture.data.purchase_units?.[0]?.payments?.captures?.[0];
  if (!captureRecord) {
    return { error: "Payment could not be confirmed. Please contact support." };
  }

  const { error: paymentError } = await admin.from("payments").insert({
    order_id: orderId,
    provider: "paypal",
    provider_payment_id: captureRecord.id,
    amount: order.total,
    status: "paid",
    raw_response: capture.data as unknown as Json,
  });

  // Unique violation on provider_payment_id means this was already
  // recorded (e.g. the webhook beat us to it) — not an error, just
  // proceed to (idempotent) fulfillment.
  if (paymentError && paymentError.code !== "23505") {
    return { error: "Could not record payment. Please contact support." };
  }

  await fulfillOrder(orderId);
  return { success: true };
}
