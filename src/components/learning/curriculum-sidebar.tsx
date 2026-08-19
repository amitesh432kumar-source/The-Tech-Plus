import Link from "next/link";
import { CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlayerModule } from "@/services/learning";

export function CurriculumSidebar({
  courseId,
  modules,
  activeLessonId,
  completedLessonIds,
  isEnrolled,
}: {
  courseId: string;
  modules: PlayerModule[];
  activeLessonId: string;
  completedLessonIds: string[];
  isEnrolled: boolean;
}) {
  return (
    <nav className="space-y-4">
      {modules.map((module) => (
        <div key={module.id}>
          <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {module.title}
          </p>
          <ul className="space-y-0.5">
            {module.lessons.map((lesson) => {
              const isActive = lesson.id === activeLessonId;
              const isDone = completedLessonIds.includes(lesson.id);
              const isLocked = !isEnrolled && !lesson.isPreview;

              const content = (
                <span className="flex items-center gap-2">
                  {isDone ? (
                    <CheckCircle2 className="size-4 shrink-0 text-[var(--brand-blue)]" />
                  ) : isLocked ? (
                    <Lock className="size-3.5 shrink-0 text-muted-foreground" />
                  ) : isActive ? (
                    <PlayCircle className="size-4 shrink-0 text-[var(--brand-blue)]" />
                  ) : (
                    <Circle className="size-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="line-clamp-1">{lesson.title}</span>
                </span>
              );

              return (
                <li key={lesson.id}>
                  {isLocked ? (
                    <div className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-muted-foreground opacity-60">
                      {content}
                    </div>
                  ) : (
                    <Link
                      href={`/dashboard/courses/${courseId}/lesson/${lesson.id}`}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-muted",
                        isActive && "bg-muted font-medium",
                      )}
                    >
                      {content}
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {lesson.durationMinutes}m
                      </span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
