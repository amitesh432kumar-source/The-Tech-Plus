"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/session";

export interface AdminFormState {
  error?: string;
  success?: boolean;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function linesToArray(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function courseFieldsFromForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();

  return {
    title,
    slug: slugInput ? slugify(slugInput) : slugify(title),
    short_description: String(formData.get("shortDescription") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    category_id: String(formData.get("categoryId") ?? "") || null,
    instructor_id: String(formData.get("instructorId") ?? "") || null,
    level: String(formData.get("level") ?? "beginner"),
    price: Number(formData.get("price") ?? 0),
    original_price: formData.get("originalPrice") ? Number(formData.get("originalPrice")) : null,
    status: String(formData.get("status") ?? "draft"),
    featured: formData.get("featured") === "on",
    learning_outcomes: linesToArray(formData.get("learningOutcomes")),
    requirements: linesToArray(formData.get("requirements")),
  };
}

export async function createCourseAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireRole("admin");
  const supabase = await createClient();

  const fields = courseFieldsFromForm(formData);
  if (!fields.title) return { error: "Title is required." };

  const { data, error } = await supabase.from("courses").insert(fields).select("id").single();
  if (error) return { error: error.message.includes("duplicate") ? "That slug is already in use." : "Could not create course." };

  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${data.id}/edit`);
}

export async function updateCourseAction(
  courseId: string,
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireRole("admin");
  const supabase = await createClient();

  const fields = courseFieldsFromForm(formData);
  if (!fields.title) return { error: "Title is required." };

  const { error } = await supabase.from("courses").update(fields).eq("id", courseId);
  if (error) return { error: "Could not save course." };

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}/edit`);
  return { success: true };
}

export async function deleteCourseAction(courseId: string) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("courses").delete().eq("id", courseId);
  revalidatePath("/admin/courses");
}

export async function createModuleAction(courseId: string, formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const { count } = await supabase
    .from("course_modules")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  await supabase.from("course_modules").insert({ course_id: courseId, title, order_index: count ?? 0 });
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function deleteModuleAction(moduleId: string, courseId: string) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("course_modules").delete().eq("id", moduleId);
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

/**
 * Lesson content (content_url/content_text) is withheld from the
 * authenticated role at the column-grant level (migration 0007) — reading
 * it back for an edit form requires the service-role client. Writing it
 * would work via the normal client too (RLS admin policy allows it), but
 * we use the service-role client throughout for consistency.
 */
export async function createLessonAction(moduleId: string, courseId: string, formData: FormData) {
  await requireRole("admin");
  const admin = createAdminClient();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const { count } = await admin
    .from("course_lessons")
    .select("id", { count: "exact", head: true })
    .eq("module_id", moduleId);

  await admin.from("course_lessons").insert({
    module_id: moduleId,
    title,
    content_type: String(formData.get("contentType") ?? "video"),
    content_url: String(formData.get("contentUrl") ?? "").trim() || null,
    content_text: String(formData.get("contentText") ?? "").trim() || null,
    duration_minutes: Number(formData.get("durationMinutes") ?? 0),
    is_preview: formData.get("isPreview") === "on",
    order_index: count ?? 0,
  });

  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function deleteLessonAction(lessonId: string, courseId: string) {
  await requireRole("admin");
  const admin = createAdminClient();
  await admin.from("course_lessons").delete().eq("id", lessonId);
  revalidatePath(`/admin/courses/${courseId}/edit`);
}
