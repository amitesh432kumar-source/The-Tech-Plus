import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { CourseForm } from "@/components/admin/course-form";
import { requireRole } from "@/lib/auth/session";
import { listCategoriesForAdmin, listInstructorsForAdmin } from "@/services/admin-courses";
import { createCourseAction } from "@/features/admin/courses";

export const metadata: Metadata = { title: "New Course" };

export default async function NewCoursePage() {
  await requireRole("admin");
  const [categories, instructors] = await Promise.all([
    listCategoriesForAdmin(),
    listInstructorsForAdmin(),
  ]);

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">New Course</h1>
      <div className="mt-6 max-w-2xl">
        <CourseForm action={createCourseAction} categories={categories} instructors={instructors} />
      </div>
    </AdminShell>
  );
}
