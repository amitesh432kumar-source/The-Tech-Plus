"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleCouponActiveAction } from "@/features/admin/coupons";

export function CouponToggle({ couponId, active }: { couponId: string; active: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      checked={active}
      disabled={pending}
      onCheckedChange={(checked) => startTransition(() => toggleCouponActiveAction(couponId, checked))}
    />
  );
}
