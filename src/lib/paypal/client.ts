import "server-only";

const PAYPAL_MODE = process.env.PAYPAL_MODE === "live" ? "live" : "sandbox";
const PAYPAL_API_BASE =
  PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

export function isPaypalConfigured() {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

async function getAccessToken(): Promise<string> {
  if (!isPaypalConfigured()) {
    throw new Error("PayPal is not configured (missing PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET).");
  }

  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`PayPal auth failed: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token as string;
}

/** Creates a PayPal order. Amount is a decimal string, e.g. "499.00". */
export async function createPaypalOrder(params: {
  internalOrderId: string;
  amount: string;
  currency: string;
  itemTitle: string;
}) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.internalOrderId,
          description: params.itemTitle.slice(0, 127),
          custom_id: params.internalOrderId,
          amount: {
            currency_code: params.currency,
            value: params.amount,
          },
        },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`PayPal order creation failed: ${response.status}`);
  }

  return response.json() as Promise<{ id: string; status: string }>;
}

/** Captures a previously-created and buyer-approved PayPal order. */
export async function capturePaypalOrder(paypalOrderId: string) {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  const data = await response.json();
  return { ok: response.ok, status: response.status, data } as {
    ok: boolean;
    status: number;
    data: {
      id: string;
      status: string;
      purchase_units?: Array<{
        reference_id?: string;
        payments?: { captures?: Array<{ id: string; status: string; amount: { value: string; currency_code: string } }> };
      }>;
    };
  };
}

/** Verifies a PayPal webhook's signature via PayPal's own verification endpoint. */
export async function verifyPaypalWebhookSignature(params: {
  headers: {
    transmissionId: string;
    transmissionTime: string;
    certUrl: string;
    authAlgo: string;
    transmissionSig: string;
  };
  webhookId: string;
  webhookEvent: unknown;
}) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transmission_id: params.headers.transmissionId,
      transmission_time: params.headers.transmissionTime,
      cert_url: params.headers.certUrl,
      auth_algo: params.headers.authAlgo,
      transmission_sig: params.headers.transmissionSig,
      webhook_id: params.webhookId,
      webhook_event: params.webhookEvent,
    }),
    cache: "no-store",
  });

  if (!response.ok) return false;
  const data = await response.json();
  return data.verification_status === "SUCCESS";
}
