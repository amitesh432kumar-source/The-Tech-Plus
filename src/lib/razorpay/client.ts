import "server-only";
import Razorpay from "razorpay";

export function isRazorpayConfigured() {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

/** Server-side Razorpay SDK client. Throws if keys aren't configured — callers should check isRazorpayConfigured() first for a friendly error instead. */
export function getRazorpayClient() {
  if (!isRazorpayConfigured()) {
    throw new Error("Razorpay is not configured (missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET).");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}
