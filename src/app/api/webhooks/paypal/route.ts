import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillOrder } from "@/services/fulfillment";
import { verifyPaypalWebhookSignature } from "@/lib/paypal/client";

/**
 * PayPal webhook — the reliability backstop behind the client-side
 * capturePaymentAction. Handles cases the client-side flow can miss: the
 * browser tab closing before the capture call fires, a network blip, etc.
 * Idempotent by construction: fulfillOrder() and the payments table's
 * unique constraint on provider_payment_id make replays/duplicates safe,
 * which also covers PayPal's documented at-least-once retry behavior.
 *
 * Configure this URL in the PayPal developer dashboard as:
 *   https://<your-domain>/api/webhooks/paypal
 * with event: PAYMENT.CAPTURE.COMPLETED (minimum). Set PAYPAL_WEBHOOK_ID to
 * the webhook ID shown there.
 */
export async function POST(request: NextRequest) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    // Not configured yet — acknowledge so PayPal doesn't retry forever,
    // but do nothing. Real verification is impossible without the ID.
    return NextResponse.json({ received: false, reason: "webhook not configured" }, { status: 200 });
  }

  const rawBody = await request.text();
  const transmissionId = request.headers.get("paypal-transmission-id");
  const transmissionTime = request.headers.get("paypal-transmission-time");
  const certUrl = request.headers.get("paypal-cert-url");
  const authAlgo = request.headers.get("paypal-auth-algo");
  const transmissionSig = request.headers.get("paypal-transmission-sig");

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return NextResponse.json({ error: "missing signature headers" }, { status: 400 });
  }

  const webhookEvent = JSON.parse(rawBody);

  const valid = await verifyPaypalWebhookSignature({
    headers: { transmissionId, transmissionTime, certUrl, authAlgo, transmissionSig },
    webhookId,
    webhookEvent,
  });

  if (!valid) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (webhookEvent.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    const capture = webhookEvent.resource;
    const internalOrderId: string | undefined = capture?.custom_id ?? capture?.supplementary_data?.related_ids?.order_id;

    if (capture?.id && internalOrderId) {
      const admin = createAdminClient();

      const { data: order } = await admin
        .from("orders")
        .select("id, total")
        .eq("id", internalOrderId)
        .single();

      if (order) {
        const { error: paymentError } = await admin.from("payments").insert({
          order_id: order.id,
          provider: "paypal",
          provider_payment_id: capture.id,
          amount: order.total,
          status: "paid",
          raw_response: capture,
        });

        // 23505 = already recorded by the client-side capture call — fine,
        // still run fulfillment since it's idempotent.
        if (!paymentError || paymentError.code === "23505") {
          await fulfillOrder(order.id);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
