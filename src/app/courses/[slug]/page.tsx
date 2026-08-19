import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, Layers, Star, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/courses/course-card";
import { CourseCurriculum } from "@/components/courses/course-curriculum";
import { CourseEnrollCard } from "@/components/courses/course-enroll-card";
import { CourseMobileCta } from "@/components/courses/course-mobile-cta";
import { ReviewForm } from "@/components/courses/review-form";
import { JsonLd } from "@/components/seo/json-ld";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getCourseBySlug, listRelatedCourses } from "@/services/courses";
import { listFaqsByCategory } from "@/services/faqs";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};

  return {
    title: course.title,
    description: course.shortDescription,
    openGraph: {
      title: `${course.title} | ${siteConfig.name}`,
      description: course.shortDescription,
      type: "website",
    },
  };
}

const levelLabel: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const [related, faqs, user] = await Promise.all([
    listRelatedCourses(slug, course.category, 3),
    listFaqsByCategory("courses"),
    getCurrentUser(),
  ]);

  let isEnrolled = false;
  let hasReviewed = false;
  if (user) {
    const supabase = await createClient();
    const [{ data: enrollment }, { data: existingReview }] = await Promise.all([
      supabase
        .from("course_enrollments")
        .select("id")
        .eq("course_id", course.id)
        .eq("student_id", user.id)
        .maybeSingle(),
      supabase
        .from("reviews")
        .select("id")
        .eq("course_id", course.id)
        .eq("student_id", user.id)
        .maybeSingle(),
    ]);
    isEnrolled = !!enrollment;
    hasReviewed = !!existingReview;
  }

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.title,
          description: course.shortDescription,
          provider: {
            "@type": "Organization",
            name: siteConfig.name,
            sameAs: siteConfig.url,
          },
          ...(course.reviewCount > 0 && {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: course.rating,
              reviewCount: course.reviewCount,
            },
          }),
          offers: {
            "@type": "Offer",
            price: course.price,
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
            url: `${siteConfig.url}/courses/${slug}`,
          },
        }}
      />
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 pt-8 pb-24 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8 lg:pb-12">
        <div>
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="size-3" />
            <Link href="/courses" className="hover:text-foreground">Courses</Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">{course.title}</span>
          </nav>

          <Badge variant="outline">{levelLabel[course.level]}</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {course.title}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{course.shortDescription}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <User className="size-4" /> {course.instructor}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers className="size-4" /> {course.lessonCount} lessons
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" /> {course.durationHours}h
            </span>
            {course.reviewCount > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-4 fill-current text-[var(--brand-purple)]" />
                {course.rating.toFixed(1)} ({course.reviewCount} reviews)
              </span>
            )}
          </div>

          <div className="mt-10 space-y-12">
            <div>
              <h2 className="mb-3 text-xl font-bold tracking-tight">About This Course</h2>
              <p className="whitespace-pre-line text-muted-foreground">{course.description}</p>
            </div>

            {course.learningOutcomes.length > 0 && (
              <div>
                <h2 className="mb-3 text-xl font-bold tracking-tight">What You&apos;ll Learn</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {course.learningOutcomes.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--brand-blue)]" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {course.requirements.length > 0 && (
              <div>
                <h2 className="mb-3 text-xl font-bold tracking-tight">Requirements</h2>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {course.requirements.map((req) => (
                    <li key={req}>• {req}</li>
                  ))}
                </ul>
              </div>
            )}

            <CourseCurriculum modules={course.modules} />

            <div>
              <h2 className="mb-3 text-xl font-bold tracking-tight">Instructor</h2>
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="font-semibold">{course.instructor}</p>
                {course.instructorExpertise && (
                  <p className="text-sm text-[var(--brand-blue)]">{course.instructorExpertise}</p>
                )}
                {course.instructorBio && (
                  <p className="mt-2 text-sm text-muted-foreground">{course.instructorBio}</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold tracking-tight">
                Reviews {course.reviewCount > 0 && `(${course.reviewCount})`}
              </h2>
              {course.reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reviews yet — be the first to review this course after completing it.
                </p>
              ) : (
                <div className="space-y-4">
                  {course.reviews.map((review) => (
                    <div key={review.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{review.studentName}</p>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3.5 ${
                                i < review.rating
                                  ? "fill-current text-[var(--brand-purple)]"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.reviewText && (
                        <p className="mt-1.5 text-sm text-muted-foreground">{review.reviewText}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isEnrolled && !hasReviewed && (
                <div className="mt-4">
                  <ReviewForm courseId={course.id} courseSlug={slug} />
                </div>
              )}
            </div>

            {faqs.length > 0 && (
              <div>
                <h2 className="mb-3 text-xl font-bold tracking-tight">Frequently Asked Questions</h2>
                <Accordion className="rounded-2xl border border-border bg-card px-4">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <CourseEnrollCard
              course={course}
              isAuthenticated={!!user}
              isEnrolled={isEnrolled}
              courseSlug={slug}
            />
          </div>
        </aside>
      </section>

      {related.length > 0 && (
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-xl font-bold tracking-tight">Related Courses</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((c) => (
                <CourseCard key={c.slug} course={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CourseMobileCta
        courseId={course.id}
        price={course.price}
        isAuthenticated={!!user}
        isEnrolled={isEnrolled}
        courseSlug={slug}
      />
    </>
  );
}
