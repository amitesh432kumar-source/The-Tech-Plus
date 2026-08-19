/**
 * View-model shapes consumed by the public UI. Services in `src/services`
 * map raw Supabase rows into these — components never touch DB row shapes
 * directly, so the UI doesn't need to change if the schema does.
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

export interface CourseLessonView {
  id: string;
  title: string;
  contentType: string;
  durationMinutes: number;
  isPreview: boolean;
}

export interface CourseModuleView {
  id: string;
  title: string;
  lessons: CourseLessonView[];
}

export interface CourseReviewView {
  id: string;
  rating: number;
  reviewText: string | null;
  createdAt: string;
  studentName: string;
}

export interface CourseDetail extends CourseSummary {
  description: string;
  learningOutcomes: string[];
  requirements: string[];
  instructorBio: string | null;
  instructorExpertise: string | null;
  modules: CourseModuleView[];
  reviews: CourseReviewView[];
}

export type WebinarStatus = "draft" | "upcoming" | "live" | "completed" | "cancelled";

export interface WebinarSummary {
  id: string;
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

export interface WebinarDetail extends WebinarSummary {
  speakerBio: string | null;
  timezone: string;
  meetingUrl: string | null;
  recordingUrl: string | null;
}

export type WorkshopType = "workshop" | "bootcamp" | "live-class" | "event";

export interface WorkshopSummary {
  id: string;
  slug: string;
  title: string;
  type: WorkshopType;
  description: string;
  date: string;
  durationHours: number;
  price: number | "free";
  seatsTotal: number;
  seatsTaken: number;
  status: WebinarStatus;
}

export interface WorkshopDetail extends WorkshopSummary {
  meetingUrl: string | null;
  recordingUrl: string | null;
}

export interface InstructorSummary {
  id: string;
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
  category: "courses" | "webinars" | "payments" | "access" | "certificates" | "account" | "support" | "general";
}
