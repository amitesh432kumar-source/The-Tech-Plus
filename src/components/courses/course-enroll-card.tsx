import Link from "next/link";
import { BookOpen, Clock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CourseDetail } from "@/types/content";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CourseEnrollCard({
  course,
  isAuthenticated,
  courseSlug,
}: {
  course: CourseDetail;
  isAuthenticated: boolean;
  courseSlug: string;
}) {
  const discount =
    course.originalPrice && course.originalPrice > course.price
      ? Math.round(100 - (course.price / course.originalPrice) * 100)
      : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">{formatPrice(course.price)}</span>
        {course.originalPrice && (
          <span className="text-muted-foreground line-through">
            {formatPrice(course.originalPrice)}
          </span>
        )}
        {discount && (
          <span className="text-sm font-medium text-[var(--brand-blue)]">{discount}% off</span>
        )}
      </div>

      {isAuthenticated ? (
        <Button size="lg" className="mt-4 w-full" disabled>
          Enrollment Opens Soon
        </Button>
      ) : (
        <Button
          size="lg"
          className="mt-4 w-full"
          render={<Link href={`/login?next=/courses/${courseSlug}`} />}
        >
          Login to Enroll
        </Button>
      )}
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Course purchases open soon — payments are being finalized.
      </p>

      <div className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Layers className="size-4" /> {course.modules.length} modules · {course.lessonCount} lessons
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="size-4" /> {course.durationHours}h of content
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <BookOpen className="size-4" /> Lifetime access once enrolled
        </div>
      </div>
    </div>
  );
}
