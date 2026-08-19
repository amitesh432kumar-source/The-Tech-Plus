import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { WorkshopCard } from "@/components/workshops/workshop-card";
import { listWorkshops } from "@/services/events";

export const metadata: Metadata = {
  title: "Workshops",
  description: "Hands-on workshops, bootcamps, and live classes from The Tech Plus.",
};

export default async function WorkshopsPage() {
  const workshops = await listWorkshops();

  return (
    <>
      <PageHeader
        eyebrow="Workshops & Live Classes"
        title="Hands-On Workshops & Events"
        description="Intensive, hands-on sessions — bootcamps, workshops, and special live events."
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {workshops.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
            No workshops scheduled right now — check back soon.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workshops.map((workshop) => (
              <WorkshopCard key={workshop.slug} workshop={workshop} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
