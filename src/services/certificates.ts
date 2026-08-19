import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

export interface MyCertificate {
  id: string;
  certificateCode: string;
  courseTitle: string;
  issuedAt: string;
}

export async function listMyCertificates(studentId: string): Promise<MyCertificate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("certificates")
    .select("id, certificate_code, course_title_snapshot, issued_at")
    .eq("student_id", studentId)
    .order("issued_at", { ascending: false });

  if (error || !data) return [];

  return data.map((c) => ({
    id: c.id,
    certificateCode: c.certificate_code,
    courseTitle: c.course_title_snapshot,
    issuedAt: c.issued_at,
  }));
}

/**
 * Issues a certificate the first time a student completes every lesson in
 * a course. Idempotent (unique constraint on student_id+course_id) and
 * uses the service-role client since certificate issuance is a system
 * action, not something a client should be able to trigger arbitrarily.
 */
export async function issueCertificateIfCourseComplete(
  enrollmentId: string,
  courseId: string,
  studentId: string,
): Promise<{ issued: boolean; certificateCode?: string }> {
  const admin = createAdminClient();

  const { count: totalLessons } = await admin
    .from("course_lessons")
    .select("id, course_modules!inner(course_id)", { count: "exact", head: true })
    .eq("course_modules.course_id", courseId);

  const { count: completedLessons } = await admin
    .from("course_progress")
    .select("id", { count: "exact", head: true })
    .eq("enrollment_id", enrollmentId);

  if (!totalLessons || (completedLessons ?? 0) < totalLessons) {
    return { issued: false };
  }

  const { data: existing } = await admin
    .from("certificates")
    .select("certificate_code")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) return { issued: false, certificateCode: existing.certificate_code };

  const [{ data: profile }, { data: course }] = await Promise.all([
    admin.from("profiles").select("full_name").eq("id", studentId).single(),
    admin
      .from("courses")
      .select("title, instructors(display_name, profiles(full_name))")
      .eq("id", courseId)
      .single(),
  ]);

  if (!course) return { issued: false };

  const instructor = course.instructors as
    | { display_name: string | null; profiles: { full_name: string | null } | null }
    | null;
  const instructorName = instructor?.display_name ?? instructor?.profiles?.full_name ?? null;

  const certificateCode = `TTP-${randomUUID().split("-")[0].toUpperCase()}`;

  const { error } = await admin.from("certificates").insert({
    certificate_code: certificateCode,
    student_id: studentId,
    course_id: courseId,
    student_name_snapshot: profile?.full_name ?? "Student",
    course_title_snapshot: course.title,
    instructor_name_snapshot: instructorName,
  });

  if (error) return { issued: false };

  return { issued: true, certificateCode };
}
