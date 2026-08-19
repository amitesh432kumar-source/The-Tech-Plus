-- Switching the payment provider from Razorpay to PayPal (no Razorpay
-- account available). Rename the provider-specific columns to
-- provider-agnostic names — this also better matches the original intent
-- of "design payment architecture so another provider can be added
-- later." No production data exists yet, so a plain rename is safe.

alter table public.orders
  rename column razorpay_order_id to provider_order_id;

alter table public.payments
  rename column razorpay_payment_id to provider_payment_id;

alter table public.payments
  rename column razorpay_signature to provider_reference;

alter table public.payments
  add column provider text not null default 'paypal';
