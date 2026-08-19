import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface EnrolledCourseSummary {
  enrollmentId: string;
  courseId: string;
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  totalLessons: number;
  completedLessons: number;
  lastLessonId: string | null;
  firstLessonId: string | null;
}

/** All courses a student is enrolled in, with progress computed from course_progress. */
export async function listEnrolledCourses(studentId: string): Promise<EnrolledCourseSummary[]> {
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("course_enrollments")
    .select("id, course_id, last_lesson_id, courses(slug, title, thumbnail_url)")
    .eq("student_id", studentId)
    .order("enrolled_at", { ascending: false });

  if (!enrollments || enrollments.length === 0) return [];

  const results: EnrolledCourseSummary[] = [];

  for (const e of enrollments) {
    const course = e.courses as { slug: string; title: string; thumbnail_url: string | null } | null;
    if (!course) continue;

    const { data: modules } = await supabase
      .from("course_modules")
      .select("id, order_index, course_lessons(id, order_index)")
      .eq("course_id", e.course_id)
      .order("order_index", { ascending: true });

    const lessons = (modules ?? [])
      .flatMap((m) => m.course_lessons as { id: string; order_index: number }[])
      .sort((a, b) => a.order_index - b.order_index);

    const { count: completedCount } = await supabase
      .from("course_progress")
      .select("id", { count: "exact", head: true })
      .eq("enrollment_id", e.id);

    results.push({
      enrollmentId: e.id,
      courseId: e.course_id,
      slug: course.slug,
      title: course.title,
      thumbnailUrl: course.thumbnail_url,
      totalLessons: lessons.length,
      completedLessons: completedCount ?? 0,
      lastLessonId: e.last_lesson_id,
      firstLessonId: lessons[0]?.id ?? null,
    });
  }

  return results;
}

export interface PlayerLesson {
  id: string;
  title: string;
  contentType: string;
  durationMinutes: number;
  isPreview: boolean;
  orderIndex: number;
}

export interface PlayerModule {
  id: string;
  title: string;
  orderIndex: number;
  lessons: PlayerLesson[];
}

export interface PlayerData {
  course: { id: string; slug: string; title: string };
  modules: PlayerModule[];
  completedLessonIds: string[];
  enrollmentId: string | null;
  isEnrolled: boolean;
  activeLesson: {
    id: string;
    title: string;
    contentType: string;
    contentUrl: string | null;
    contentText: string | null;
    isPreview: boolean;
    resources: { id: string; title: string; fileUrl: string; fileType: string | null }[];
  } | null;
}

/**
 * Loads everything the lesson player needs. Lesson metadata (titles,
 * durations, ordering) comes from the normal client since it's publicly
 * readable for published courses. The active lesson's actual content
 * (content_url/content_text) is fetched via the service-role client and
 * only attached if the caller is enrolled, is admin, or the lesson is a
 * free preview — RLS intentionally withholds those columns from the
 * anon/authenticated roles entirely (see migration 0007).
 */
export async function getCoursePlayerData(
  courseId: string,
  lessonId: string,
  studentId: string,
  isAdmin: boolean,
): Promise<PlayerData | null> {
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, title")
    .eq("id", courseId)
    .single();

  if (!course) return null;

  const { data: moduleRows } = await supabase
    .from("course_modules")
    .select("id, title, order_index, course_lessons(id, title, content_type, duration_minutes, order_index, is_preview)")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  interface RawLessonRow {
    id: string;
    title: string;
    content_type: string;
    duration_minutes: number;
    order_index: number;
    is_preview: boolean;
  }

  const modules: PlayerModule[] = (moduleRows ?? []).map((m) => ({
    id: m.id,
    title: m.title,
    orderIndex: m.order_index,
    lessons: (m.course_lessons as RawLessonRow[])
      .map((l) => ({
        id: l.id,
        title: l.title,
        contentType: l.content_type,
        durationMinutes: l.duration_minutes,
        isPreview: l.is_preview,
        orderIndex: l.order_index,
      }))
      .sort((a, b) => a.orderIndex - b.orderIndex),
  }));

  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("course_id", courseId)
    .eq("student_id", studentId)
    .maybeSingle();

  const isEnrolled = !!enrollment;

  const { data: progressRows } = enrollment
    ? await supabase.from("course_progress").select("lesson_id").eq("enrollment_id", enrollment.id)
    : { data: [] as { lesson_id: string }[] };

  const lessonMeta = modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);

  let activeLesson: PlayerData["activeLesson"] = null;

  if (lessonMeta && (isEnrolled || isAdmin || lessonMeta.isPreview)) {
    const admin = createAdminClient();
    const { data: fullLesson } = await admin
      .from("course_lessons")
      .select("id, title, content_type, content_url, content_text, is_preview")
      .eq("id", lessonId)
      .single();

    const { data: resources } = await admin
      .from("course_resources")
      .select("id, title, file_url, file_type")
      .eq("lesson_id", lessonId);

    if (fullLesson) {
      activeLesson = {
        id: fullLesson.id,
        title: fullLesson.title,
        contentType: fullLesson.content_type,
        contentUrl: fullLesson.content_url,
        contentText: fullLesson.content_text,
        isPreview: fullLesson.is_preview,
        resources: (resources ?? []).map((r) => ({
          id: r.id,
          title: r.title,
          fileUrl: r.file_url,
          fileType: r.file_type,
        })),
      };
    }
  }

  return {
    course,
    modules,
    completedLessonIds: (progressRows ?? []).map((r) => r.lesson_id),
    enrollmentId: enrollment?.id ?? null,
    isEnrolled,
    activeLesson,
  };
}
