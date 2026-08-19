/**
 * Central brand & site configuration for The Tech Plus.
 * Update values here rather than hardcoding brand strings across the app.
 */
export const siteConfig = {
  name: "The Tech Plus",
  shortName: "TechPlus",
  tagline: "Learn Technology. Build Skills. Create Your Future.",
  description:
    "The Tech Plus is a modern technology education platform offering practical courses, live webinars, workshops, and real-world projects.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/og-image.png",
  links: {
    twitter: "",
    linkedin: "",
    youtube: "",
  },
  contactEmail: "support@thetechplus.com",
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Webinars", href: "/webinars" },
  { label: "Workshops", href: "/workshops" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;
