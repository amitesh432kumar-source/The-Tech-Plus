import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with The Tech Plus.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Get in Touch"
        description="Have a question about a course, webinar, or your account? Reach out and we'll get back to you."
      />
      <section className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-gradient-brand text-white">
            <Mail className="size-5" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Email us directly at</p>
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="text-lg font-semibold text-[var(--brand-blue)] hover:underline"
          >
            {siteConfig.contactEmail}
          </a>
          <p className="mt-6 text-xs text-muted-foreground">
            A dedicated contact form with ticket tracking will be available in a future update.
          </p>
        </div>
      </section>
    </>
  );
}
