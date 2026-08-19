import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth/session";
import { listEnrolledCourses } from "@/services/learning";

export const metadata: Metadata = { title: "My Courses" };

export default async function DashboardCoursesPage() {
  const user = await requireUser();
  const courses = await listEnrolledCourses(user.id);

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Courses you&apos;re enrolled in and your progress through each.
      </p>

      {courses.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <BookOpen className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            You haven&apos;t enrolled in any courses yet.
          </p>
          <Button className="mt-4" render={<Link href="/courses" />}>
            Browse Courses
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {courses.map((c) => {
            const pct = c.totalLessons > 0 ? Math.round((c.completedLessons / c.totalLessons) * 100) : 0;
            const nextLessonId = c.lastLessonId ?? c.firstLessonId;
            return (
              <div key={c.enrollmentId} className="rounded-2xl border border-border bg-card p-5">
                <p className="font-semibold">{c.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.completedLessons} of {c.totalLessons} lessons complete
                </p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{pct}% complete</span>
                  {nextLessonId ? (
                    <Button
                      size="sm"
                      render={<Link href={`/dashboard/courses/${c.courseId}/lesson/${nextLessonId}`} />}
                    >
                      {c.completedLessons > 0 ? "Continue" : "Start"}
                    </Button>
                  ) : (
                    <Button size="sm" disabled>
                      No lessons yet
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
