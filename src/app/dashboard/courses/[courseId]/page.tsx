import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

/** Redirects straight into the player: continue where they left off, or start at lesson one. */
export default async function CourseOverviewRedirect({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("last_lesson_id")
    .eq("course_id", courseId)
    .eq("student_id", user.id)
    .maybeSingle();

  if (!enrollment) notFound();

  if (enrollment.last_lesson_id) {
    redirect(`/dashboard/courses/${courseId}/lesson/${enrollment.last_lesson_id}`);
  }

  const { data: firstModule } = await supabase
    .from("course_modules")
    .select("course_lessons(id, order_index)")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true })
    .limit(1)
    .single();

  const firstLesson = (firstModule?.course_lessons as { id: string; order_index: number }[] | undefined)
    ?.slice()
    .sort((a, b) => a.order_index - b.order_index)[0];

  if (!firstLesson) notFound();

  redirect(`/dashboard/courses/${courseId}/lesson/${firstLesson.id}`);
}
