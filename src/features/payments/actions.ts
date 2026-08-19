"use server";

import crypto from "crypto";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayClient, isRazorpayConfigured } from "@/lib/razorpay/client";
import { validateCoupon } from "@/features/payments/coupon";
import { fulfillOrder } from "@/services/fulfillment";

export type PurchasableType = "course" | "webinar" | "event";

export interface CreateOrderState {
  error?: string;
  freeEnrollment?: boolean;
  checkout?: {
    orderId: string;
    razorpayOrderId: string;
    amount: number; // paise
    currency: string;
    keyId: string;
    itemTitle: string;
    prefillName: string;
    prefillEmail: string;
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

  // Free after discount (or free item) — skip Razorpay entirely.
  if (total <= 0) {
    await admin.from("orders").update({ status: "paid" }).eq("id", order.id);
    await fulfillOrder(order.id);
    return { freeEnrollment: true };
  }

  if (!isRazorpayConfigured()) {
    return { error: "Payments aren't configured yet. Please check back soon." };
  }

  try {
    const razorpay = getRazorpayClient();
    const rpOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: order.id,
      notes: { internal_order_id: order.id, item_type: itemType, item_id: itemId },
    });

    await admin.from("orders").update({ razorpay_order_id: rpOrder.id }).eq("id", order.id);

    return {
      checkout: {
        orderId: order.id,
        razorpayOrderId: rpOrder.id,
        amount: Math.round(total * 100),
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID!,
        itemTitle: item.title,
        prefillName: user.profile.full_name ?? "",
        prefillEmail: user.email ?? "",
      },
    };
  } catch {
    return { error: "Could not start payment. Please try again." };
  }
}

export interface VerifyState {
  error?: string;
  success?: boolean;
}

export async function verifyPaymentAction(
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): Promise<VerifyState> {
  const user = await requireUser();

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return { error: "Payments aren't configured." };
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const signatureValid =
    expectedSignature.length === razorpaySignature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpaySignature));

  if (!signatureValid) return { error: "Payment verification failed." };

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, razorpay_order_id, total")
    .eq("id", orderId)
    .single();

  if (!order || order.user_id !== user.id || order.razorpay_order_id !== razorpayOrderId) {
    return { error: "Order mismatch — please contact support." };
  }

  const { error: paymentError } = await admin.from("payments").insert({
    order_id: orderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
    amount: order.total,
    status: "paid",
  });

  // Unique violation on razorpay_payment_id means this was already
  // recorded (e.g. the webhook beat us to it) — not an error, just
  // proceed to (idempotent) fulfillment.
  if (paymentError && paymentError.code !== "23505") {
    return { error: "Could not record payment. Please contact support." };
  }

  await fulfillOrder(orderId);
  return { success: true };
}
