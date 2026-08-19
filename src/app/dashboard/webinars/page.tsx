import type { Metadata } from "next";
import Link from "next/link";
import { Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth/session";
import { listMyWebinarRegistrations } from "@/services/webinars";
import { listMyEventRegistrations } from "@/services/events";

export const metadata: Metadata = { title: "My Webinars" };

export default async function DashboardWebinarsPage() {
  const user = await requireUser();
  const [webinars, events] = await Promise.all([
    listMyWebinarRegistrations(user.id),
    listMyEventRegistrations(user.id),
  ]);

  const empty = webinars.length === 0 && events.length === 0;

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold tracking-tight">My Webinars & Workshops</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Sessions you&apos;ve registered for, with join links available closer to start time.
      </p>

      {empty ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <Radio className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No registrations yet.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button render={<Link href="/webinars" />}>Browse Webinars</Button>
            <Button variant="outline" render={<Link href="/workshops" />}>
              Browse Workshops
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {webinars.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Webinars</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {webinars.map(({ registrationId, webinar }) => (
                  <Link
                    key={registrationId}
                    href={`/webinars/${webinar.slug}`}
                    className="card-hover rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{webinar.title}</p>
                      <Badge variant="outline" className="shrink-0 capitalize">
                        {webinar.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(webinar.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {webinar.time}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {events.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                Workshops & Live Classes
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {events.map(({ registrationId, event }) => (
                  <Link
                    key={registrationId}
                    href={`/workshops/${event.slug}`}
                    className="card-hover rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{event.title}</p>
                      <Badge variant="outline" className="shrink-0 capitalize">
                        {event.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
