"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markLessonCompleteAction, type ProgressState } from "@/features/progress/actions";

const initialState: ProgressState = {};

export function MarkCompleteButton({
  courseId,
  lessonId,
  isComplete,
  nextLessonHref,
}: {
  courseId: string;
  lessonId: string;
  isComplete: boolean;
  nextLessonHref: string | null;
}) {
  const router = useRouter();
  const boundAction = markLessonCompleteAction.bind(null, courseId, lessonId);
  const [state, formAction] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state.success && nextLessonHref) {
      router.push(nextLessonHref);
    }
  }, [state.success, nextLessonHref, router]);

  if (isComplete) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--brand-blue)]">
        <CheckCircle2 className="size-4" /> Completed
        {nextLessonHref && (
          <Button size="sm" variant="outline" className="ml-2" render={<a href={nextLessonHref} />}>
            Next Lesson
          </Button>
        )}
      </div>
    );
  }

  return (
    <form action={formAction}>
      <Button type="submit" size="sm">
        {nextLessonHref ? "Mark Complete & Continue" : "Mark Complete"}
      </Button>
      {state.error && <p className="mt-1 text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
