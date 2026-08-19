import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The Tech Plus terms of service.",
};

export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms of Service" />
      <section className="mx-auto w-full max-w-3xl px-4 py-16 text-sm leading-7 text-muted-foreground sm:px-6 lg:px-8">
        <p className="text-foreground">
          This is placeholder terms content for {siteConfig.name}. Replace it with reviewed,
          legally accurate terms before launch.
        </p>
        <h2 className="mt-8 text-base font-semibold text-foreground">Course & Webinar Access</h2>
        <p className="mt-2">
          Enrollment grants access to the purchased course or webinar content subject to these terms.
        </p>
        <h2 className="mt-8 text-base font-semibold text-foreground">Payments & Refunds</h2>
        <p className="mt-2">
          Payments are processed securely. Refund eligibility will be detailed here once the
          platform&apos;s refund policy is finalized.
        </p>
        <h2 className="mt-8 text-base font-semibold text-foreground">Contact</h2>
        <p className="mt-2">
          Questions about these terms can be sent to{" "}
          <a href={`mailto:${siteConfig.contactEmail}`} className="text-[var(--brand-blue)] hover:underline">
            {siteConfig.contactEmail}
          </a>
          .
        </p>
      </section>
    </>
  );
}
