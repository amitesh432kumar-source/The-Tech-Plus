import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "The Tech Plus privacy policy.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <section className="mx-auto w-full max-w-3xl px-4 py-16 text-sm leading-7 text-muted-foreground sm:px-6 lg:px-8">
        <p className="text-foreground">
          This is placeholder policy content for {siteConfig.name}. Replace it with a
          reviewed, legally accurate privacy policy before launch.
        </p>
        <h2 className="mt-8 text-base font-semibold text-foreground">Information We Collect</h2>
        <p className="mt-2">
          Account details, course activity, and payment records associated with your use of the platform.
        </p>
        <h2 className="mt-8 text-base font-semibold text-foreground">How We Use Information</h2>
        <p className="mt-2">
          To provide access to courses and webinars, process payments, issue certificates, and communicate
          important account and platform updates.
        </p>
        <h2 className="mt-8 text-base font-semibold text-foreground">Contact</h2>
        <p className="mt-2">
          Questions about this policy can be sent to{" "}
          <a href={`mailto:${siteConfig.contactEmail}`} className="text-[var(--brand-blue)] hover:underline">
            {siteConfig.contactEmail}
          </a>
          .
        </p>
      </section>
    </>
  );
}
