import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillOrder } from "@/services/fulfillment";

/**
 * Razorpay webhook — the reliability backstop behind the client-side
 * verifyPaymentAction. Handles cases the client-side flow can miss: the
 * browser tab closing before the verify call fires, a network blip, etc.
 * Idempotent by construction: fulfillOrder() and the payments table's
 * unique constraint on razorpay_payment_id make replays/duplicates safe,
 * which also covers Razorpay's documented at-least-once retry behavior.
 *
 * Configure this URL in the Razorpay dashboard as:
 *   https://<your-domain>/api/webhooks/razorpay
 * with events: payment.captured (minimum). Set RAZORPAY_WEBHOOK_SECRET to
 * the signing secret shown there.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    // Not configured yet — acknowledge so Razorpay doesn't retry forever,
    // but do nothing. Real verification is impossible without the secret.
    return NextResponse.json({ received: false, reason: "webhook not configured" }, { status: 200 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  const valid =
    expectedSignature.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));

  if (!valid) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload?.payment?.entity;
    if (payment?.order_id && payment?.id) {
      const admin = createAdminClient();

      const { data: order } = await admin
        .from("orders")
        .select("id, total")
        .eq("razorpay_order_id", payment.order_id)
        .single();

      if (order) {
        const { error: paymentError } = await admin.from("payments").insert({
          order_id: order.id,
          razorpay_payment_id: payment.id,
          amount: order.total,
          status: "paid",
          raw_response: payment,
        });

        // 23505 = already recorded by the client-side verify call — fine,
        // still run fulfillment since it's idempotent.
        if (!paymentError || paymentError.code === "23505") {
          await fulfillOrder(order.id);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
