"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { issueCertificateIfCourseComplete } from "@/services/certificates";
import { notifyUser } from "@/services/notifications";

export interface ProgressState {
  error?: string;
  success?: boolean;
}

/** Marks a lesson complete for the current user's enrollment in this course. */
export async function markLessonCompleteAction(
  courseId: string,
  lessonId: string,
): Promise<ProgressState> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("course_id", courseId)
    .eq("student_id", user.id)
    .single();

  if (!enrollment) return { error: "You are not enrolled in this course." };

  const { error: progressError } = await supabase
    .from("course_progress")
    .insert({ enrollment_id: enrollment.id, lesson_id: lessonId });

  // Unique violation just means it was already marked complete — not an error.
  if (progressError && progressError.code !== "23505") {
    return { error: "Could not save progress. Please try again." };
  }

  await supabase
    .from("course_enrollments")
    .update({ last_lesson_id: lessonId })
    .eq("id", enrollment.id);

  const { issued, certificateCode } = await issueCertificateIfCourseComplete(
    enrollment.id,
    courseId,
    user.id,
  );

  if (issued && certificateCode) {
    await notifyUser(user.id, {
      type: "certificate_issued",
      title: "Certificate issued",
      body: `Your certificate (${certificateCode}) is ready — you completed the course.`,
    });
    revalidatePath("/dashboard/certificates");
  }

  revalidatePath(`/dashboard/courses/${courseId}`);
  revalidatePath(`/dashboard/courses/${courseId}/lesson/${lessonId}`);
  return { success: true };
}
