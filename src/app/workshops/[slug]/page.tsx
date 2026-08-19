import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WorkshopRegisterCard } from "@/components/workshops/workshop-register-card";
import { getWorkshopBySlug, isRegisteredForEvent } from "@/services/events";
import { getCurrentUser } from "@/lib/auth/session";
import { siteConfig } from "@/config/site";

const typeLabel: Record<string, string> = {
  workshop: "Workshop",
  bootcamp: "Bootcamp",
  "live-class": "Live Class",
  event: "Event",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const workshop = await getWorkshopBySlug(slug);
  if (!workshop) return {};

  return {
    title: workshop.title,
    description: workshop.description,
    openGraph: {
      title: `${workshop.title} | ${siteConfig.name}`,
      description: workshop.description,
      type: "website",
    },
  };
}

export default async function WorkshopDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workshop = await getWorkshopBySlug(slug);
  if (!workshop) notFound();

  const user = await getCurrentUser();
  const alreadyRegistered = user ? await isRegisteredForEvent(workshop.id, user.id) : false;
  const seatsLeft = workshop.seatsTotal - workshop.seatsTaken;

  const formattedDate = new Date(workshop.date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <div>
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="size-3" />
          <Link href="/workshops" className="hover:text-foreground">Workshops</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{workshop.title}</span>
        </nav>

        <Badge variant="secondary">{typeLabel[workshop.type]}</Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {workshop.title}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{workshop.description}</p>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Radio className="size-4" /> {formattedDate}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" /> {workshop.durationHours}h
          </span>
        </div>
      </div>

      <aside>
        <div className="sticky top-24">
          <WorkshopRegisterCard
            eventId={workshop.id}
            eventSlug={slug}
            date={workshop.date}
            price={workshop.price}
            seatsLeft={seatsLeft}
            isAuthenticated={!!user}
            alreadyRegistered={alreadyRegistered}
          />
        </div>
      </aside>
    </section>
  );
}
