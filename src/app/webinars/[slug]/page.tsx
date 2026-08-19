import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, Radio, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WebinarRegisterCard } from "@/components/webinars/webinar-register-card";
import { getWebinarAccessLinks, getWebinarBySlug, isRegisteredForWebinar } from "@/services/webinars";
import { listFaqsByCategory } from "@/services/faqs";
import { getCurrentUser } from "@/lib/auth/session";
import { siteConfig } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const webinar = await getWebinarBySlug(slug);
  if (!webinar) return {};

  return {
    title: webinar.title,
    description: webinar.description,
    openGraph: {
      title: `${webinar.title} | ${siteConfig.name}`,
      description: webinar.description,
      type: "website",
    },
  };
}

export default async function WebinarDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const webinar = await getWebinarBySlug(slug);
  if (!webinar) notFound();

  const [faqs, user] = await Promise.all([listFaqsByCategory("webinars"), getCurrentUser()]);
  const alreadyRegistered = user ? await isRegisteredForWebinar(webinar.id, user.id) : false;
  const isAdmin = user?.profile.role === "admin";
  const accessLinks =
    alreadyRegistered || isAdmin ? await getWebinarAccessLinks(webinar.id) : null;
  const seatsLeft = webinar.seatsTotal - webinar.seatsTaken;

  const formattedDate = new Date(webinar.date).toLocaleDateString("en-IN", {
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
          <Link href="/webinars" className="hover:text-foreground">Webinars</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{webinar.title}</span>
        </nav>

        <Badge variant="outline" className="capitalize">
          {webinar.status}
        </Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {webinar.title}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{webinar.description}</p>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <User className="size-4" /> {webinar.speaker}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Radio className="size-4" /> {formattedDate} · {webinar.time}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" /> {webinar.durationMinutes} minutes
          </span>
        </div>

        {accessLinks?.meetingUrl && (
          <div className="mt-6 rounded-xl border border-[var(--brand-blue)]/30 bg-[var(--brand-blue)]/5 p-4">
            <p className="text-sm font-medium">You&apos;re registered — here&apos;s your access link</p>
            <a
              href={accessLinks.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-[var(--brand-blue)] hover:underline"
            >
              Join the webinar →
            </a>
          </div>
        )}
        {accessLinks?.recordingUrl && (
          <div className="mt-3 rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium">Recording available</p>
            <a
              href={accessLinks.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-[var(--brand-blue)] hover:underline"
            >
              Watch the recording →
            </a>
          </div>
        )}

        {webinar.speakerBio && (
          <div className="mt-10">
            <h2 className="mb-3 text-xl font-bold tracking-tight">About the Speaker</h2>
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="font-semibold">{webinar.speaker}</p>
              <p className="mt-2 text-sm text-muted-foreground">{webinar.speakerBio}</p>
            </div>
          </div>
        )}

        {faqs.length > 0 && (
          <div className="mt-10">
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

      <aside>
        <div className="sticky top-24">
          <WebinarRegisterCard
            webinarId={webinar.id}
            webinarSlug={slug}
            date={webinar.date}
            price={webinar.price}
            seatsLeft={seatsLeft}
            isAuthenticated={!!user}
            alreadyRegistered={alreadyRegistered}
          />
        </div>
      </aside>
    </section>
  );
}
