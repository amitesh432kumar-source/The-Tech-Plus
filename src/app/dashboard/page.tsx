import type { Metadata } from "next";
import Link from "next/link";
import { Award, Bell, BookOpen, Radio, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth/session";
import { listEnrolledCourses } from "@/services/learning";
import { listMyWebinarRegistrations } from "@/services/webinars";
import { listMyCertificates } from "@/services/certificates";
import { countUnreadNotifications } from "@/services/notifications";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();

  const [courses, webinars, certificates, unreadCount] = await Promise.all([
    listEnrolledCourses(user.id),
    listMyWebinarRegistrations(user.id),
    listMyCertificates(user.id),
    countUnreadNotifications(user.id),
  ]);

  const inProgress = courses.find((c) => c.completedLessons < c.totalLessons && c.totalLessons > 0);
  const upcomingWebinars = webinars.filter((w) => w.webinar.status === "upcoming").slice(0, 3);

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold tracking-tight">
        Welcome, {user.profile.full_name ?? user.email}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Here&apos;s what&apos;s happening in your learning journey.
      </p>

      {user.profile.role === "admin" && (
        <Link
          href="/admin"
          className="mt-4 flex w-fit items-center gap-2 rounded-lg border border-[var(--brand-blue)]/30 bg-[var(--brand-blue)]/5 px-3 py-2 text-sm font-medium text-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/10"
        >
          <Shield className="size-4" /> Go to Admin Dashboard
        </Link>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Enrolled Courses" value={courses.length} href="/dashboard/courses" />
        <StatCard icon={Radio} label="Webinars & Events" value={webinars.length} href="/dashboard/webinars" />
        <StatCard icon={Award} label="Certificates" value={certificates.length} href="/dashboard/certificates" />
        <StatCard icon={Bell} label="Unread Notifications" value={unreadCount} href="/dashboard/notifications" />
      </div>

      {inProgress && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-muted-foreground">Continue Learning</p>
          <p className="mt-1 text-lg font-semibold">{inProgress.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {inProgress.completedLessons} of {inProgress.totalLessons} lessons complete
          </p>
          <Button
            className="mt-3"
            render={
              <Link
                href={`/dashboard/courses/${inProgress.courseId}/lesson/${
                  inProgress.lastLessonId ?? inProgress.firstLessonId
                }`}
              />
            }
          >
            Continue
          </Button>
        </div>
      )}

      {upcomingWebinars.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-sm font-semibold text-muted-foreground">Upcoming Webinars</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {upcomingWebinars.map(({ registrationId, webinar }) => (
              <Link
                key={registrationId}
                href={`/webinars/${webinar.slug}`}
                className="card-hover rounded-xl border border-border bg-card p-4"
              >
                <p className="text-sm font-medium">{webinar.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(webinar.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} ·{" "}
                  {webinar.time}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {courses.length === 0 && webinars.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t enrolled in anything yet — explore courses and webinars to get started.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button render={<Link href="/courses" />}>Browse Courses</Button>
            <Button variant="outline" render={<Link href="/webinars" />}>
              Browse Webinars
            </Button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link href={href} className="card-hover rounded-xl border border-border bg-card p-4">
      <Icon className="size-5 text-[var(--brand-blue)]" />
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Link>
  );
}
