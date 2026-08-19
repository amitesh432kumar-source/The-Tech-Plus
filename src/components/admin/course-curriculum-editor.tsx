"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteButton } from "@/components/admin/delete-button";
import {
  createLessonAction,
  createModuleAction,
  deleteLessonAction,
  deleteModuleAction,
} from "@/features/admin/courses";
import type { AdminCourseEditData } from "@/services/admin-courses";

export function CourseCurriculumEditor({
  courseId,
  modules,
}: {
  courseId: string;
  modules: AdminCourseEditData["modules"];
}) {
  return (
    <div className="space-y-4">
      {modules.map((m) => (
        <div key={m.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">{m.title}</p>
            <DeleteButton
              action={deleteModuleAction.bind(null, m.id, courseId)}
              confirmLabel={`Delete module "${m.title}" and all its lessons?`}
            />
          </div>

          <ul className="mt-3 space-y-1.5">
            {m.lessons.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-1.5 text-sm"
              >
                <span>
                  {l.title}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({l.contentType}, {l.durationMinutes}m{l.isPreview ? ", preview" : ""})
                  </span>
                </span>
                <DeleteButton
                  action={deleteLessonAction.bind(null, l.id, courseId)}
                  confirmLabel={`Delete lesson "${l.title}"?`}
                />
              </li>
            ))}
          </ul>

          <AddLessonForm moduleId={m.id} courseId={courseId} />
        </div>
      ))}

      <AddModuleForm courseId={courseId} />
    </div>
  );
}

function AddModuleForm({ courseId }: { courseId: string }) {
  const [title, setTitle] = useState("");

  return (
    <form
      action={async (formData) => {
        await createModuleAction(courseId, formData);
        setTitle("");
      }}
      className="flex gap-2"
    >
      <Input
        name="title"
        placeholder="New module title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-8"
      />
      <Button type="submit" size="sm" variant="outline">
        <Plus className="size-3.5" /> Add Module
      </Button>
    </form>
  );
}

function AddLessonForm({ moduleId, courseId }: { moduleId: string; courseId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button type="button" size="sm" variant="ghost" className="mt-2" onClick={() => setOpen(true)}>
        <Plus className="size-3.5" /> Add Lesson
      </Button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await createLessonAction(moduleId, courseId, formData);
        setOpen(false);
      }}
      className="mt-3 space-y-2 rounded-lg border border-dashed border-border p-3"
    >
      <Input name="title" placeholder="Lesson title" required className="h-8" />
      <div className="grid grid-cols-2 gap-2">
        <select
          name="contentType"
          defaultValue="video"
          className="h-8 rounded-lg border border-border bg-background px-2 text-sm"
        >
          <option value="video">Video</option>
          <option value="text">Text</option>
          <option value="pdf">PDF</option>
          <option value="external">External link</option>
          <option value="download">Download</option>
        </select>
        <Input name="durationMinutes" type="number" min={0} placeholder="Minutes" className="h-8" />
      </div>
      <Input name="contentUrl" placeholder="Content URL (video/pdf/external)" className="h-8" />
      <textarea
        name="contentText"
        placeholder="Text content (for text lessons)"
        rows={2}
        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm"
      />
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" name="isPreview" className="size-3.5 rounded border-border" />
        Free preview lesson
      </label>
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Save Lesson
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          <Trash2 className="size-3.5" /> Cancel
        </Button>
      </div>
    </form>
  );
}
