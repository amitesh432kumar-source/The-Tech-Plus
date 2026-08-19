import { Hero } from "@/components/marketing/hero";
import { TrustBenefits } from "@/components/marketing/trust-benefits";
import { FeaturedCourses } from "@/components/marketing/featured-courses";
import { UpcomingWebinars } from "@/components/marketing/upcoming-webinars";
import { Workshops } from "@/components/marketing/workshops";
import { WhyTechPlus } from "@/components/marketing/why-tech-plus";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Instructors } from "@/components/marketing/instructors";
import { Testimonials } from "@/components/marketing/testimonials";
import { FaqSection } from "@/components/marketing/faq-section";
import { FinalCta } from "@/components/marketing/final-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBenefits />
      <FeaturedCourses />
      <UpcomingWebinars />
      <Workshops />
      <WhyTechPlus />
      <HowItWorks />
      <Instructors />
      <Testimonials />
      <FaqSection />
      <FinalCta />
    </>
  );
}
