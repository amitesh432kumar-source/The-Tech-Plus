import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { WebinarCard } from "@/components/webinars/webinar-card";
import { listWebinars } from "@/services/webinars";

export const metadata: Metadata = {
  title: "Webinars",
  description: "Join live webinars hosted by The Tech Plus instructors.",
};

export default async function WebinarsPage() {
  const webinars = await listWebinars();

  return (
    <>
      <PageHeader
        eyebrow="Webinars"
        title="Upcoming Webinars"
        description="Join live sessions with instructors and get your questions answered in real time."
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {webinars.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
            No webinars scheduled right now — check back soon.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {webinars.map((webinar) => (
              <WebinarCard key={webinar.slug} webinar={webinar} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
