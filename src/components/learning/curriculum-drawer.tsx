"use client";

import { useState } from "react";
import { List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CurriculumSidebar } from "@/components/learning/curriculum-sidebar";
import type { PlayerModule } from "@/services/learning";

export function CurriculumDrawer({
  courseId,
  courseTitle,
  modules,
  activeLessonId,
  completedLessonIds,
  isEnrolled,
}: {
  courseId: string;
  courseTitle: string;
  modules: PlayerModule[];
  activeLessonId: string;
  completedLessonIds: string[];
  isEnrolled: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setOpen(true)}>
        <List className="size-4" /> Curriculum
      </Button>
      <SheetContent side="left" className="w-4/5 overflow-y-auto p-4">
        <SheetHeader className="px-0">
          <SheetTitle className="line-clamp-1">{courseTitle}</SheetTitle>
        </SheetHeader>
        <div onClick={() => setOpen(false)}>
          <CurriculumSidebar
            courseId={courseId}
            modules={modules}
            activeLessonId={activeLessonId}
            completedLessonIds={completedLessonIds}
            isEnrolled={isEnrolled}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
