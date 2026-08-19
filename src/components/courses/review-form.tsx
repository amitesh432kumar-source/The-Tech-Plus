"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitReviewAction, type ReviewState } from "@/features/reviews/actions";

const initialState: ReviewState = {};

export function ReviewForm({ courseId, courseSlug }: { courseId: string; courseSlug: string }) {
  const boundAction = submitReviewAction.bind(null, courseId, courseSlug);
  const [state, formAction] = useActionState(boundAction, initialState);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  if (state.success) {
    return (
      <p className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Thanks — your review has been submitted and will appear once approved.
      </p>
    );
  }

  return (
    <form action={formAction} className="rounded-xl border border-border bg-card p-4">
      <p className="mb-2 text-sm font-medium">Leave a review</p>
      <input type="hidden" name="rating" value={rating} />
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star
              className={`size-6 ${
                n <= (hoverRating || rating)
                  ? "fill-current text-[var(--brand-purple)]"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
      <Textarea
        name="reviewText"
        placeholder="What did you think of this course? (optional)"
        rows={3}
        className="mt-3"
      />
      {state.error && <p className="mt-2 text-sm text-destructive">{state.error}</p>}
      <Button type="submit" size="sm" className="mt-3" disabled={rating === 0}>
        Submit Review
      </Button>
    </form>
  );
}
