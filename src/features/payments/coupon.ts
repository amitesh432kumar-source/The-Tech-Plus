import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  couponId?: string;
  discountAmount?: number;
}

/**
 * Validates a coupon code server-side against the live coupons table
 * (only reachable via the service-role client — coupons has no
 * client-select RLS policy by design, see migration 0002). Never trust a
 * discount amount computed on the client.
 */
export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
  if (!code.trim()) return { valid: false, error: "Enter a coupon code." };

  const admin = createAdminClient();
  const { data: coupon } = await admin
    .from("coupons")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .eq("active", true)
    .maybeSingle();

  if (!coupon) return { valid: false, error: "Invalid coupon code." };

  const now = new Date();
  if (new Date(coupon.valid_from) > now) return { valid: false, error: "This coupon isn't active yet." };
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return { valid: false, error: "This coupon has expired." };
  }
  if (coupon.usage_limit !== null && coupon.times_used >= coupon.usage_limit) {
    return { valid: false, error: "This coupon has reached its usage limit." };
  }
  if (subtotal < coupon.min_amount) {
    return { valid: false, error: `This coupon requires a minimum order of ₹${coupon.min_amount}.` };
  }

  const discountAmount =
    coupon.discount_type === "percentage"
      ? Math.round((subtotal * coupon.discount_value) / 100)
      : Math.min(coupon.discount_value, subtotal);

  return { valid: true, couponId: coupon.id, discountAmount };
}
