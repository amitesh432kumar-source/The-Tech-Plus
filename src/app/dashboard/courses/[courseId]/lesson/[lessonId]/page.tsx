import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CurriculumSidebar } from "@/components/learning/curriculum-sidebar";
import { CurriculumDrawer } from "@/components/learning/curriculum-drawer";
import { LessonContent } from "@/components/learning/lesson-content";
import { MarkCompleteButton } from "@/components/learning/mark-complete-button";
import { requireUser } from "@/lib/auth/session";
import { getCoursePlayerData } from "@/services/learning";

export const metadata: Metadata = { title: "Course Player" };

export default async function LessonPlayerPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const user = await requireUser();

  const data = await getCoursePlayerData(courseId, lessonId, user.id, user.profile.role === "admin");
  if (!data) notFound();

  if (!data.isEnrolled && user.profile.role !== "admin") {
    // Not enrolled and this isn't a free preview lesson — bounce to checkout entry point.
    const isPreview = data.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId)?.isPreview;
    if (!isPreview) notFound();
  }

  const allLessons = data.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const isComplete = data.completedLessonIds.includes(lessonId);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-border bg-card p-4">
          <p className="mb-3 line-clamp-2 px-1 text-sm font-semibold">{data.course.title}</p>
          <CurriculumSidebar
            courseId={courseId}
            modules={data.modules}
            activeLessonId={lessonId}
            completedLessonIds={data.completedLessonIds}
            isEnrolled={data.isEnrolled}
          />
        </div>
      </aside>

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href={`/courses/${data.course.slug}`}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← Back to course details
          </Link>
          <CurriculumDrawer
            courseId={courseId}
            courseTitle={data.course.title}
            modules={data.modules}
            activeLessonId={lessonId}
            completedLessonIds={data.completedLessonIds}
            isEnrolled={data.isEnrolled}
          />
        </div>

        {data.activeLesson ? (
          <>
            <h1 className="mb-4 text-xl font-bold tracking-tight">{data.activeLesson.title}</h1>

            <LessonContent
              contentType={data.activeLesson.contentType}
              contentUrl={data.activeLesson.contentUrl}
              contentText={data.activeLesson.contentText}
            />

            {data.activeLesson.resources.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-2 text-sm font-semibold">Resources</h2>
                <ul className="space-y-2">
                  {data.activeLesson.resources.map((r) => (
                    <li key={r.id}>
                      <a
                        href={r.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
                      >
                        <Download className="size-4 text-muted-foreground" />
                        {r.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!prevLesson}
                  render={
                    prevLesson ? (
                      <Link href={`/dashboard/courses/${courseId}/lesson/${prevLesson.id}`} />
                    ) : undefined
                  }
                >
                  <ChevronLeft className="size-4" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!nextLesson}
                  render={
                    nextLesson ? (
                      <Link href={`/dashboard/courses/${courseId}/lesson/${nextLesson.id}`} />
                    ) : undefined
                  }
                >
                  Next <ChevronRight className="size-4" />
                </Button>
              </div>

              {data.isEnrolled && (
                <MarkCompleteButton
                  courseId={courseId}
                  lessonId={lessonId}
                  isComplete={isComplete}
                  nextLessonHref={
                    nextLesson ? `/dashboard/courses/${courseId}/lesson/${nextLesson.id}` : null
                  }
                />
              )}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="font-medium">This lesson is locked</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Enroll in this course to access the full curriculum.
            </p>
            <Button className="mt-4" render={<Link href={`/courses/${data.course.slug}`} />}>
              View Course
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
