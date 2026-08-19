"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import type { AdminFormState } from "@/features/admin/courses";

export async function createCouponAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireRole("admin");
  const supabase = await createClient();

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const discountType = String(formData.get("discountType") ?? "percentage");
  const discountValue = Number(formData.get("discountValue") ?? 0);
  const minAmount = Number(formData.get("minAmount") ?? 0);
  const usageLimitRaw = String(formData.get("usageLimit") ?? "").trim();
  const validUntilRaw = String(formData.get("validUntil") ?? "").trim();

  if (!code) return { error: "Coupon code is required." };
  if (discountValue <= 0) return { error: "Discount value must be greater than 0." };

  const { error } = await supabase.from("coupons").insert({
    code,
    discount_type: discountType,
    discount_value: discountValue,
    min_amount: minAmount,
    usage_limit: usageLimitRaw ? Number(usageLimitRaw) : null,
    valid_until: validUntilRaw ? new Date(validUntilRaw).toISOString() : null,
    active: true,
  });

  if (error) {
    return { error: error.code === "23505" ? "That coupon code already exists." : "Could not create coupon." };
  }

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function toggleCouponActiveAction(couponId: string, active: boolean) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("coupons").update({ active }).eq("id", couponId);
  revalidatePath("/admin/coupons");
}

export async function deleteCouponAction(couponId: string) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("coupons").delete().eq("id", couponId);
  revalidatePath("/admin/coupons");
}
