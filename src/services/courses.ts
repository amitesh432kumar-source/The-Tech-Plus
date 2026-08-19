import { createClient } from "@/lib/supabase/server";
import type { CourseDetail, CourseLevel, CourseSummary } from "@/types/content";
import type { Tables } from "@/types/database";

type CourseRow = Tables<"courses">;

interface CourseJoinRow extends CourseRow {
  categories: { name: string } | null;
  instructors: { display_name: string | null } | null;
  course_modules?: { course_lessons: { id: string; duration_minutes: number }[] }[];
}

function summaryStats(modules: CourseJoinRow["course_modules"]) {
  const lessons = (modules ?? []).flatMap((m) => m.course_lessons);
  const lessonCount = lessons.length;
  const durationHours = Math.round((lessons.reduce((s, l) => s + l.duration_minutes, 0) / 60) * 10) / 10;
  return { lessonCount, durationHours };
}

function toSummary(row: CourseJoinRow): CourseSummary {
  const { lessonCount, durationHours } = summaryStats(row.course_modules);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description ?? "",
    category: row.categories?.name ?? "General",
    instructor: row.instructors?.display_name ?? "The Tech Plus",
    rating: 0,
    reviewCount: 0,
    lessonCount,
    durationHours,
    level: row.level as CourseLevel,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    currency: "INR",
    featured: row.featured,
  };
}

const COURSE_SELECT =
  "*, categories(name), instructors(display_name), course_modules(course_lessons(id, duration_minutes))";

export interface CourseFilters {
  search?: string;
  category?: string;
  level?: CourseLevel;
  sort?: "popular" | "price-asc" | "price-desc" | "newest";
}

/** Published courses for the /courses listing, with basic filtering. */
export async function listCourses(filters: CourseFilters = {}) {
  const supabase = await createClient();

  let query = supabase.from("courses").select(COURSE_SELECT).eq("status", "published");

  if (filters.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }
  if (filters.category) {
    query = query.eq("categories.slug", filters.category);
  }
  if (filters.level) {
    query = query.eq("level", filters.level);
  }

  switch (filters.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("featured", { ascending: false }).order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return (data as unknown as CourseJoinRow[])
    .filter((row) => (filters.category ? row.categories !== null : true))
    .map(toSummary);
}

export async function listFeaturedCourses(limit = 4): Promise<CourseSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_SELECT)
    .eq("status", "published")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return (data as unknown as CourseJoinRow[]).map(toSummary);
}

export async function listCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("name, slug").order("name");
  return data ?? [];
}

export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("courses")
    .select(
      "*, categories(name), instructors(display_name, bio, expertise), course_modules(id, title, order_index, course_lessons(id, title, content_type, duration_minutes, order_index, is_preview))",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !row) return null;

  const { data: reviewRows } = await supabase
    .from("reviews")
    .select("id, rating, review_text, created_at, profiles(full_name)")
    .eq("course_id", row.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const modules = (row.course_modules ?? [])
    .slice()
    .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
    .map(
      (m: {
        id: string;
        title: string;
        course_lessons: Array<{
          id: string;
          title: string;
          content_type: string;
          duration_minutes: number;
          order_index: number;
          is_preview: boolean;
        }>;
      }) => ({
        id: m.id,
        title: m.title,
        lessons: m.course_lessons
          .slice()
          .sort((a, b) => a.order_index - b.order_index)
          .map((l) => ({
            id: l.id,
            title: l.title,
            contentType: l.content_type,
            durationMinutes: l.duration_minutes,
            isPreview: l.is_preview,
          })),
      }),
    );

  const lessonCount = modules.reduce((sum: number, m) => sum + m.lessons.length, 0);
  const durationHours =
    Math.round(
      (modules.reduce((sum: number, m) => sum + m.lessons.reduce((s, l) => s + l.durationMinutes, 0), 0) / 60) * 10,
    ) / 10;

  const reviews = (reviewRows ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    reviewText: r.review_text,
    createdAt: r.created_at,
    studentName: (r.profiles as { full_name: string | null } | null)?.full_name ?? "Student",
  }));

  const rating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return {
    ...toSummary(row as unknown as CourseJoinRow),
    lessonCount,
    durationHours,
    description: row.description ?? "",
    learningOutcomes: row.learning_outcomes ?? [],
    requirements: row.requirements ?? [],
    instructorBio: row.instructors?.bio ?? null,
    instructorExpertise: row.instructors?.expertise ?? null,
    modules,
    reviews,
    rating,
    reviewCount: reviews.length,
  };
}

export async function listRelatedCourses(courseSlug: string, categoryName: string, limit = 3): Promise<CourseSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_SELECT)
    .eq("status", "published")
    .eq("categories.name", categoryName)
    .neq("slug", courseSlug)
    .limit(limit);

  if (error || !data) return [];

  return (data as unknown as CourseJoinRow[]).filter((row) => row.categories !== null).map(toSummary);
}
