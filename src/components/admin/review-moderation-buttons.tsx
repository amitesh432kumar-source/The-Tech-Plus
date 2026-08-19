"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { moderateReviewAction } from "@/features/admin/reviews";

export function ReviewModerationButtons({ reviewId }: { reviewId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() => startTransition(() => moderateReviewAction(reviewId, "approved"))}
      >
        <Check className="size-3.5" /> Approve
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={() => startTransition(() => moderateReviewAction(reviewId, "rejected"))}
      >
        <X className="size-3.5" /> Reject
      </Button>
    </div>
  );
}
