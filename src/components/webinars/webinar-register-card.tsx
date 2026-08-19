"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/webinars/countdown";
import { registerForWebinarAction, type RegisterState } from "@/features/webinars/actions";

const initialState: RegisterState = {};

export function WebinarRegisterCard({
  webinarId,
  webinarSlug,
  date,
  price,
  seatsLeft,
  isAuthenticated,
  alreadyRegistered,
}: {
  webinarId: string;
  webinarSlug: string;
  date: string;
  price: number | "free";
  seatsLeft: number;
  isAuthenticated: boolean;
  alreadyRegistered: boolean;
}) {
  const boundAction = registerForWebinarAction.bind(null, webinarId, webinarSlug);
  const [state, formAction] = useActionState(boundAction, initialState);

  const isFull = seatsLeft <= 0;
  const registered = alreadyRegistered || state.success;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Starts in
      </p>
      <Countdown target={date} />

      <div className="mt-6 flex items-baseline justify-between">
        <span className="text-2xl font-bold">{price === "free" ? "Free" : `₹${price}`}</span>
        <span className="text-xs text-muted-foreground">
          {isFull ? "Fully booked" : `${seatsLeft} seats left`}
        </span>
      </div>

      {registered ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2.5 text-sm text-foreground">
          <CheckCircle2 className="size-4 shrink-0 text-[var(--brand-blue)]" />
          You&apos;re registered for this webinar.
        </div>
      ) : isAuthenticated ? (
        price === "free" ? (
          <form action={formAction} className="mt-4">
            <Button type="submit" className="w-full" disabled={isFull}>
              {isFull ? "Fully Booked" : "Register Now"}
            </Button>
            {state.error && <p className="mt-2 text-sm text-destructive">{state.error}</p>}
          </form>
        ) : (
          <div className="mt-4">
            <Button className="w-full" disabled>
              Registration Opens Soon
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Paid webinar registration launches with payments.
            </p>
          </div>
        )
      ) : (
        <Button className="mt-4 w-full" render={<Link href={`/login?next=/webinars/${webinarSlug}`} />}>
          Login to Register
        </Button>
      )}
    </div>
  );
}
