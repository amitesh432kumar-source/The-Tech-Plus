"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/auth/submit-button";
import type { AdminFormState } from "@/features/admin/courses";

const selectClass =
  "h-8 w-full rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function CourseForm({
  action,
  categories,
  instructors,
  defaultValues,
}: {
  action: (prev: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  categories: { id: string; name: string }[];
  instructors: { id: string; name: string }[];
  defaultValues?: {
    title?: string;
    slug?: string;
    shortDescription?: string;
    description?: string;
    categoryId?: string | null;
    instructorId?: string | null;
    level?: string;
    price?: number;
    originalPrice?: number | null;
    status?: string;
    featured?: boolean;
    learningOutcomes?: string[];
    requirements?: string[];
  };
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={defaultValues?.title} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug (auto from title if blank)</Label>
          <Input id="slug" name="slug" defaultValue={defaultValues?.slug} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="shortDescription">Short description</Label>
        <Textarea
          id="shortDescription"
          name="shortDescription"
          rows={2}
          defaultValue={defaultValues?.shortDescription}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Full description</Label>
        <Textarea id="description" name="description" rows={5} defaultValue={defaultValues?.description} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={defaultValues?.categoryId ?? ""}
            className={selectClass}
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="instructorId">Instructor</Label>
          <select
            id="instructorId"
            name="instructorId"
            defaultValue={defaultValues?.instructorId ?? ""}
            className={selectClass}
          >
            <option value="">None</option>
            {instructors.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="level">Level</Label>
          <select id="level" name="level" defaultValue={defaultValues?.level ?? "beginner"} className={selectClass}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Price (₹)</Label>
          <Input id="price" name="price" type="number" min={0} step="0.01" defaultValue={defaultValues?.price ?? 0} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="originalPrice">Original price (₹)</Label>
          <Input
            id="originalPrice"
            name="originalPrice"
            type="number"
            min={0}
            step="0.01"
            defaultValue={defaultValues?.originalPrice ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={defaultValues?.status ?? "draft"} className={selectClass}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={defaultValues?.featured} className="size-4 rounded border-border" />
        Featured on homepage
      </label>

      <div className="space-y-1.5">
        <Label htmlFor="learningOutcomes">Learning outcomes (one per line)</Label>
        <Textarea
          id="learningOutcomes"
          name="learningOutcomes"
          rows={4}
          defaultValue={defaultValues?.learningOutcomes?.join("\n")}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="requirements">Requirements (one per line)</Label>
        <Textarea
          id="requirements"
          name="requirements"
          rows={3}
          defaultValue={defaultValues?.requirements?.join("\n")}
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-[var(--brand-blue)]">Saved</p>}
      <SubmitButton className="w-auto">Save Course</SubmitButton>
    </form>
  );
}
