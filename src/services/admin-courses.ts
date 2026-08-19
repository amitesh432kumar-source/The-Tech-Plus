import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminCourseListItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  price: number;
  featured: boolean;
  categoryName: string | null;
}

export async function listAdminCourses(): Promise<AdminCourseListItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("id, slug, title, status, price, featured, categories(name)")
    .order("created_at", { ascending: false });

  return (data ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    status: c.status,
    price: c.price,
    featured: c.featured,
    categoryName: (c.categories as { name: string } | null)?.name ?? null,
  }));
}

export interface AdminCourseEditData {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  categoryId: string | null;
  instructorId: string | null;
  level: string;
  price: number;
  originalPrice: number | null;
  status: string;
  featured: boolean;
  learningOutcomes: string[];
  requirements: string[];
  modules: {
    id: string;
    title: string;
    orderIndex: number;
    lessons: {
      id: string;
      title: string;
      contentType: string;
      contentUrl: string | null;
      contentText: string | null;
      durationMinutes: number;
      isPreview: boolean;
      orderIndex: number;
    }[];
  }[];
}

export async function getAdminCourseForEdit(courseId: string): Promise<AdminCourseEditData | null> {
  const supabase = await createClient();
  const { data: course } = await supabase.from("courses").select("*").eq("id", courseId).single();
  if (!course) return null;

  const { data: modules } = await supabase
    .from("course_modules")
    .select("id, title, order_index")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  // Lesson content columns need the service-role client (see migration 0007).
  const admin = createAdminClient();
  const moduleWithLessons = await Promise.all(
    (modules ?? []).map(async (m) => {
      const { data: lessons } = await admin
        .from("course_lessons")
        .select("id, title, content_type, content_url, content_text, duration_minutes, is_preview, order_index")
        .eq("module_id", m.id)
        .order("order_index", { ascending: true });

      return {
        id: m.id,
        title: m.title,
        orderIndex: m.order_index,
        lessons: (lessons ?? []).map((l) => ({
          id: l.id,
          title: l.title,
          contentType: l.content_type,
          contentUrl: l.content_url,
          contentText: l.content_text,
          durationMinutes: l.duration_minutes,
          isPreview: l.is_preview,
          orderIndex: l.order_index,
        })),
      };
    }),
  );

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    shortDescription: course.short_description ?? "",
    description: course.description ?? "",
    categoryId: course.category_id,
    instructorId: course.instructor_id,
    level: course.level,
    price: course.price,
    originalPrice: course.original_price,
    status: course.status,
    featured: course.featured,
    learningOutcomes: course.learning_outcomes ?? [],
    requirements: course.requirements ?? [],
    modules: moduleWithLessons,
  };
}

export async function listCategoriesForAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("id, name").order("name");
  return data ?? [];
}

export async function listInstructorsForAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("instructors").select("id, display_name").order("display_name");
  return (data ?? []).map((i) => ({ id: i.id, name: i.display_name ?? "Unnamed" }));
}
