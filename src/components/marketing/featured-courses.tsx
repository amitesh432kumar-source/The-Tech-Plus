import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/courses/course-card";
import { listFeaturedCourses } from "@/services/courses";

export async function FeaturedCourses() {
  const featured = await listFeaturedCourses(4);

  if (featured.length === 0) return null;

  return (
    <section className="border-b border-border">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Featured Courses
            </h2>
            <p className="mt-2 max-w-lg text-muted-foreground">
              Practical, project-based courses to build real technology skills.
            </p>
          </div>
          <Button variant="outline" render={<Link href="/courses" />}>
            View All Courses <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
