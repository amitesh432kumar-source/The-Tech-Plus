import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebinarCard } from "@/components/webinars/webinar-card";
import { listUpcomingWebinars } from "@/services/webinars";

export async function UpcomingWebinars() {
  const webinars = await listUpcomingWebinars(3);

  if (webinars.length === 0) return null;

  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Upcoming Webinars
            </h2>
            <p className="mt-2 max-w-lg text-muted-foreground">
              Join live sessions with instructors and get your questions answered in real time.
            </p>
          </div>
          <Button variant="outline" render={<Link href="/webinars" />}>
            View All Webinars <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {webinars.map((webinar) => (
            <WebinarCard key={webinar.slug} webinar={webinar} />
          ))}
        </div>
      </div>
    </section>
  );
}
