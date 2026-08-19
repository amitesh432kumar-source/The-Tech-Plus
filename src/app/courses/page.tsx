import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { CourseCard } from "@/components/courses/course-card";
import { demoCourses } from "@/config/demo-data";

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse practical, project-based technology courses on The Tech Plus.",
};

export default function CoursesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Courses"
        title="Explore Our Courses"
        description="Practical, project-based courses to build real technology skills — search and filtering are coming soon."
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {demoCourses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </section>
    </>
  );
}
