import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { WorkshopCard } from "@/components/workshops/workshop-card";
import { demoWorkshops } from "@/config/demo-data";

export const metadata: Metadata = {
  title: "Workshops",
  description: "Hands-on workshops, bootcamps, and live classes from The Tech Plus.",
};

export default function WorkshopsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Workshops & Live Classes"
        title="Hands-On Workshops & Events"
        description="Intensive, hands-on sessions — bootcamps, workshops, and special live events."
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {demoWorkshops.map((workshop) => (
            <WorkshopCard key={workshop.slug} workshop={workshop} />
          ))}
        </div>
      </section>
    </>
  );
}
