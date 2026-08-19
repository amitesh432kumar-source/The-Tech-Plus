import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { FaqSection } from "@/components/marketing/faq-section";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about courses, webinars, payments, and certificates.",
};

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        description="Answers to common questions about courses, webinars, payments, and certificates."
      />
      <FaqSection showHeading={false} />
    </>
  );
}
