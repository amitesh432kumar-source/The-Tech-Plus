import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminShell } from "@/components/admin/admin-shell";
import { DeleteButton } from "@/components/admin/delete-button";
import { requireRole } from "@/lib/auth/session";
import { listAdminCourses } from "@/services/admin-courses";
import { deleteCourseAction } from "@/features/admin/courses";

export const metadata: Metadata = { title: "Admin · Courses" };

export default async function AdminCoursesPage() {
  await requireRole("admin");
  const courses = await listAdminCourses();

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">{courses.length} total</p>
        </div>
        <Button render={<Link href="/admin/courses/new" />}>
          <Plus className="size-4" /> New Course
        </Button>
      </div>

      <div className="mt-6 space-y-2">
        {courses.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div>
              <p className="font-medium">{c.title}</p>
              <p className="text-xs text-muted-foreground">
                {c.categoryName ?? "Uncategorized"} · ₹{c.price}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {c.featured && <Badge variant="secondary">Featured</Badge>}
              <Badge variant={c.status === "published" ? "default" : "outline"} className="capitalize">
                {c.status}
              </Badge>
              <Button variant="outline" size="sm" render={<Link href={`/admin/courses/${c.id}/edit`} />}>
                Edit
              </Button>
              <DeleteButton action={deleteCourseAction.bind(null, c.id)} confirmLabel={`Delete "${c.title}"?`} />
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No courses yet.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
