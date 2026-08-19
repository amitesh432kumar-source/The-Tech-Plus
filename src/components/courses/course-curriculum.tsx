import { Lock, PlayCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CourseModuleView } from "@/types/content";

export function CourseCurriculum({ modules }: { modules: CourseModuleView[] }) {
  const lessonCount = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xl font-bold tracking-tight">Curriculum</h2>
        <span className="text-sm text-muted-foreground">
          {modules.length} modules · {lessonCount} lessons
        </span>
      </div>
      <Accordion className="rounded-2xl border border-border bg-card px-4">
        {modules.map((module, i) => (
          <AccordionItem key={module.id} value={module.id}>
            <AccordionTrigger>
              <span>
                <span className="text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}.
                </span>{" "}
                {module.title}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2">
                {module.lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      {lesson.isPreview ? (
                        <PlayCircle className="size-4 shrink-0 text-[var(--brand-blue)]" />
                      ) : (
                        <Lock className="size-3.5 shrink-0 text-muted-foreground" />
                      )}
                      {lesson.title}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {lesson.durationMinutes}m
                    </span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
