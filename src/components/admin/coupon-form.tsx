"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { createCouponAction } from "@/features/admin/coupons";

export function CouponForm() {
  const [state, formAction] = useActionState(createCouponAction, {});

  return (
    <form action={formAction} className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-6">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="code">Code</Label>
        <Input id="code" name="code" placeholder="LAUNCH20" required className="h-8" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="discountType">Type</Label>
        <select
          id="discountType"
          name="discountType"
          defaultValue="percentage"
          className="h-8 w-full rounded-lg border border-border bg-background px-2 text-sm"
        >
          <option value="percentage">%</option>
          <option value="fixed">₹ fixed</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="discountValue">Value</Label>
        <Input id="discountValue" name="discountValue" type="number" min={0} step="0.01" required className="h-8" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="minAmount">Min ₹</Label>
        <Input id="minAmount" name="minAmount" type="number" min={0} step="0.01" defaultValue={0} className="h-8" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="usageLimit">Usage limit</Label>
        <Input id="usageLimit" name="usageLimit" type="number" min={1} placeholder="∞" className="h-8" />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="validUntil">Expires (optional)</Label>
        <Input id="validUntil" name="validUntil" type="date" className="h-8" />
      </div>
      <div className="flex items-end sm:col-span-2">
        <SubmitButton className="w-full">Create Coupon</SubmitButton>
      </div>
      {state.error && <p className="text-sm text-destructive sm:col-span-6">{state.error}</p>}
    </form>
  );
}
