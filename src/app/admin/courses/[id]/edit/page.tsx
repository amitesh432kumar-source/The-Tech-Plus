import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { CourseForm } from "@/components/admin/course-form";
import { CourseCurriculumEditor } from "@/components/admin/course-curriculum-editor";
import { requireRole } from "@/lib/auth/session";
import {
  getAdminCourseForEdit,
  listCategoriesForAdmin,
  listInstructorsForAdmin,
} from "@/services/admin-courses";
import { updateCourseAction } from "@/features/admin/courses";

export const metadata: Metadata = { title: "Edit Course" };

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  const { id } = await params;

  const [course, categories, instructors] = await Promise.all([
    getAdminCourseForEdit(id),
    listCategoriesForAdmin(),
    listInstructorsForAdmin(),
  ]);

  if (!course) notFound();

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Edit Course</h1>

      <div className="mt-6 max-w-2xl">
        <CourseForm
          action={updateCourseAction.bind(null, id)}
          categories={categories}
          instructors={instructors}
          defaultValues={course}
        />
      </div>

      <div className="mt-10 max-w-2xl">
        <h2 className="mb-3 text-lg font-bold tracking-tight">Curriculum</h2>
        <CourseCurriculumEditor courseId={id} modules={course.modules} />
      </div>
    </AdminShell>
  );
}
