/**
 * Lightweight content shapes used by the public marketing UI until the
 * database schema (Phase 3) and CMS-backed fetching (Phase 4) land. Keep
 * these aligned with the eventual `courses`/`webinars`/etc. tables.
 */

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface CourseSummary {
  slug: string;
  title: string;
  shortDescription: string;
  category: string;
  instructor: string;
  rating: number;
  reviewCount: number;
  lessonCount: number;
  durationHours: number;
  level: CourseLevel;
  price: number;
  originalPrice?: number;
  currency: "INR";
  featured?: boolean;
}

export type WebinarStatus = "upcoming" | "live" | "completed" | "cancelled";

export interface WebinarSummary {
  slug: string;
  title: string;
  description: string;
  speaker: string;
  date: string; // ISO date
  time: string; // e.g. "7:00 PM IST"
  durationMinutes: number;
  price: number | "free";
  seatsTotal: number;
  seatsTaken: number;
  status: WebinarStatus;
}

export interface WorkshopSummary {
  slug: string;
  title: string;
  type: "workshop" | "bootcamp" | "live-class" | "event";
  description: string;
  date: string;
  durationHours: number;
}

export interface InstructorSummary {
  slug: string;
  name: string;
  expertise: string;
  bio: string;
  courseCount: number;
}

export interface TestimonialSummary {
  studentName: string;
  course: string;
  rating: number;
  quote: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: "courses" | "webinars" | "payments" | "access" | "certificates" | "account" | "support";
}
