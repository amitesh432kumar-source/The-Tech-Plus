import Link from "next/link";
import { Clock, Star, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CourseSummary } from "@/types/content";

const levelLabel: Record<CourseSummary["level"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CourseCard({ course }: { course: CourseSummary }) {
  const discount =
    course.originalPrice && course.originalPrice > course.price
      ? Math.round(100 - (course.price / course.originalPrice) * 100)
      : null;

  return (
    <Card className="card-hover overflow-hidden border-border ring-0">
      <div className="relative flex aspect-video items-center justify-center bg-gradient-brand text-white">
        <span className="text-sm font-medium opacity-80">{course.category}</span>
        {discount && (
          <Badge className="absolute right-3 top-3 bg-background/90 text-foreground">
            {discount}% off
          </Badge>
        )}
      </div>
      <CardHeader>
        <Badge variant="outline" className="w-fit">
          {levelLabel[course.level]}
        </Badge>
        <CardTitle className="text-base">{course.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {course.shortDescription}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <User className="size-3.5" /> {course.instructor}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {course.durationHours}h · {course.lessonCount} lessons
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 fill-current text-[var(--brand-purple)]" />
            {course.rating.toFixed(1)} ({course.reviewCount})
          </span>
        </div>
      </CardContent>
      <CardFooter className="mt-2 flex items-center justify-between border-none bg-transparent px-(--card-spacing) pb-(--card-spacing)">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">{formatPrice(course.price)}</span>
          {course.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(course.originalPrice)}
            </span>
          )}
        </div>
        <Button size="sm" render={<Link href={`/courses/${course.slug}`} />}>
          View Course
        </Button>
      </CardFooter>
    </Card>
  );
}
