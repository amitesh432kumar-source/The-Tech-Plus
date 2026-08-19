import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { CourseCard } from "@/components/courses/course-card";
import { CourseFilters } from "@/components/courses/course-filters";
import { listCategories, listCourses } from "@/services/courses";
import type { CourseLevel } from "@/types/content";

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse practical, project-based technology courses on The Tech Plus.",
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; level?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const [courses, categories] = await Promise.all([
    listCourses({
      search: params.q,
      category: params.category,
      level: params.level as CourseLevel | undefined,
      sort: params.sort as "popular" | "price-asc" | "price-desc" | "newest" | undefined,
    }),
    listCategories(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Courses"
        title="Explore Our Courses"
        description="Practical, project-based courses to build real technology skills."
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <CourseFilters categories={categories} />

        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
            No courses match your filters. Try adjusting your search.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
