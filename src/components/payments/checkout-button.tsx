"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createOrderAction,
  capturePaymentAction,
  type PurchasableType,
  type CreateOrderState,
} from "@/features/payments/actions";
import { loadPaypalScript } from "@/components/payments/paypal-types";

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
  const [checkout, setCheckout] = useState<CreateOrderState["checkout"] | null>(null);
  const paypalContainerRef = useRef<HTMLDivElement>(null);

  function handleStartCheckout() {
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
        setCheckout(result.checkout);
      }
    });
  }

  useEffect(() => {
    if (!checkout || !paypalContainerRef.current) return;

    let cancelled = false;
    let buttonsInstance: { close: () => Promise<void> } | null = null;

    loadPaypalScript(checkout.clientId, checkout.currency)
      .then(() => {
        if (cancelled || !window.paypal || !paypalContainerRef.current) return;

        const buttons = window.paypal.Buttons({
          style: { layout: "vertical", color: "blue", shape: "rect", label: "pay" },
          createOrder: async () => checkout.paypalOrderId,
          onApprove: async () => {
            startTransition(async () => {
              const captureResult = await capturePaymentAction(checkout.orderId, checkout.paypalOrderId);
              if (captureResult.error) {
                setError(captureResult.error);
              } else {
                setSuccess(true);
                router.refresh();
              }
            });
          },
          onError: () => {
            setError("Payment could not be completed. Please try again.");
          },
        });

        buttonsInstance = buttons;
        buttons.render(paypalContainerRef.current);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load the payment window. Please try again.");
      });

    return () => {
      cancelled = true;
      buttonsInstance?.close().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout]);

  if (success) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--brand-blue)]">
        <CheckCircle2 className="size-4" /> {successLabel}
      </div>
    );
  }

  if (checkout) {
    return (
      <div className="space-y-2">
        <div ref={paypalContainerRef} />
        {error && <p className="text-xs text-destructive">{error}</p>}
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
      <Button className="w-full" onClick={handleStartCheckout} disabled={pending}>
        {pending ? "Please wait…" : buttonLabel}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
