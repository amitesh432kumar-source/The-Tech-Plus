import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkshopCard } from "@/components/workshops/workshop-card";
import { listUpcomingWorkshops } from "@/services/events";

export async function Workshops() {
  const workshops = await listUpcomingWorkshops(3);

  if (workshops.length === 0) return null;

  return (
    <section className="border-b border-border">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Workshops &amp; Live Classes
            </h2>
            <p className="mt-2 max-w-lg text-muted-foreground">
              Intensive, hands-on sessions — bootcamps, workshops, and special live events.
            </p>
          </div>
          <Button variant="outline" render={<Link href="/workshops" />}>
            View All Workshops <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workshops.map((workshop) => (
            <WorkshopCard key={workshop.slug} workshop={workshop} />
          ))}
        </div>
      </div>
    </section>
  );
}
