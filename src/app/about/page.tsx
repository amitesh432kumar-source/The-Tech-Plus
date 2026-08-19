import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { WhyTechPlus } from "@/components/marketing/why-tech-plus";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Instructors } from "@/components/marketing/instructors";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about The Tech Plus and how the platform helps you build practical technology skills.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Us"
        title="Practical Technology Education for the Future"
        description="The Tech Plus is a technology education platform focused on practical, hands-on learning through courses, live webinars, and workshops."
      />
      <WhyTechPlus />
      <HowItWorks />
      <Instructors />
    </>
  );
}
