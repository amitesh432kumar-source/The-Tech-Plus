"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/config/site";
import {
  createOrderAction,
  verifyPaymentAction,
  type PurchasableType,
} from "@/features/payments/actions";
import { loadRazorpayScript } from "@/components/payments/razorpay-types";

export function CheckoutButton({
  itemType,
  itemId,
  buttonLabel = "Enroll Now",
  successLabel = "You have access",
  showCoupon = true,
}: {
  itemType: PurchasableType;
  itemId: string;
  buttonLabel?: string;
  successLabel?: string;
  showCoupon?: boolean;
}) {
  const router = useRouter();
  const [coupon, setCoupon] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleCheckout() {
    setError(null);
    startTransition(async () => {
      const result = await createOrderAction(itemType, itemId, coupon || undefined);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.freeEnrollment) {
        setSuccess(true);
        router.refresh();
        return;
      }

      if (result.checkout) {
        try {
          await loadRazorpayScript();
        } catch {
          setError("Could not load the payment window. Please try again.");
          return;
        }

        if (!window.Razorpay) {
          setError("Could not load the payment window. Please try again.");
          return;
        }

        const checkout = result.checkout;
        const razorpay = new window.Razorpay({
          key: checkout.keyId,
          amount: checkout.amount,
          currency: checkout.currency,
          name: siteConfig.name,
          description: checkout.itemTitle,
          order_id: checkout.razorpayOrderId,
          prefill: { name: checkout.prefillName, email: checkout.prefillEmail },
          theme: { color: "#4f7cff" },
          handler: (response) => {
            startTransition(async () => {
              const verifyResult = await verifyPaymentAction(
                checkout.orderId,
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature,
              );
              if (verifyResult.error) {
                setError(verifyResult.error);
              } else {
                setSuccess(true);
                router.refresh();
              }
            });
          },
        });
        razorpay.open();
      }
    });
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--brand-blue)]">
        <CheckCircle2 className="size-4" /> {successLabel}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showCoupon && (
        <div className="relative">
          <Tag className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Coupon code (optional)"
            className="h-8 pl-8 text-xs"
          />
        </div>
      )}
      <Button className="w-full" onClick={handleCheckout} disabled={pending}>
        {pending ? "Please wait…" : buttonLabel}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
