/**
 * ⚠ DEMO CONTENT — placeholder data for UI development only.
 *
 * None of this represents real courses, webinars, instructors, or students.
 * It exists so the public UI has something to render before Phase 3
 * (database) and Phase 4 (live content fetching) wire this up to Supabase.
 * Replace every usage of this file with real data fetching in that phase —
 * do not ship it to production.
 */
import type {
  CourseSummary,
  FaqItem,
  InstructorSummary,
  TestimonialSummary,
  WebinarSummary,
  WorkshopSummary,
} from "@/types/content";

export const demoCourses: CourseSummary[] = [
  {
    slug: "full-stack-web-development",
    title: "Full-Stack Web Development",
    shortDescription: "Build and ship production web apps with modern JavaScript, React, and Node.js.",
    category: "Web Development",
    instructor: "Demo Instructor",
    rating: 4.8,
    reviewCount: 214,
    lessonCount: 86,
    durationHours: 42,
    level: "beginner",
    price: 4999,
    originalPrice: 8999,
    currency: "INR",
    featured: true,
  },
  {
    slug: "practical-machine-learning",
    title: "Practical Machine Learning",
    shortDescription: "Learn ML fundamentals and build real models with Python, scikit-learn, and PyTorch.",
    category: "Artificial Intelligence",
    instructor: "Demo Instructor",
    rating: 4.7,
    reviewCount: 156,
    lessonCount: 64,
    durationHours: 36,
    level: "intermediate",
    price: 5999,
    originalPrice: 9999,
    currency: "INR",
    featured: true,
  },
  {
    slug: "cloud-devops-fundamentals",
    title: "Cloud & DevOps Fundamentals",
    shortDescription: "Deploy, automate, and scale applications using Docker, CI/CD, and cloud platforms.",
    category: "DevOps",
    instructor: "Demo Instructor",
    rating: 4.6,
    reviewCount: 98,
    lessonCount: 52,
    durationHours: 28,
    level: "intermediate",
    price: 4499,
    originalPrice: 7499,
    currency: "INR",
    featured: true,
  },
  {
    slug: "python-for-automation",
    title: "Python for Automation",
    shortDescription: "Automate real-world tasks and workflows with practical Python scripting.",
    category: "Programming",
    instructor: "Demo Instructor",
    rating: 4.9,
    reviewCount: 302,
    lessonCount: 40,
    durationHours: 20,
    level: "beginner",
    price: 2999,
    originalPrice: 4999,
    currency: "INR",
    featured: true,
  },
];

export const demoWebinars: WebinarSummary[] = [
  {
    slug: "intro-to-generative-ai",
    title: "Introduction to Generative AI",
    description: "A practical overview of how generative AI models work and how to build with them.",
    speaker: "Demo Speaker",
    date: "2026-09-02",
    time: "7:00 PM IST",
    durationMinutes: 60,
    price: "free",
    seatsTotal: 500,
    seatsTaken: 312,
    status: "upcoming",
  },
  {
    slug: "career-paths-in-tech",
    title: "Career Paths in Tech: Choosing Your Track",
    description: "A guided session on evaluating technology career paths and building a learning plan.",
    speaker: "Demo Speaker",
    date: "2026-09-10",
    time: "6:30 PM IST",
    durationMinutes: 45,
    price: "free",
    seatsTotal: 300,
    seatsTaken: 140,
    status: "upcoming",
  },
  {
    slug: "system-design-crash-course",
    title: "System Design Crash Course",
    description: "Core system design concepts through practical, real-world examples.",
    speaker: "Demo Speaker",
    date: "2026-09-18",
    time: "8:00 PM IST",
    durationMinutes: 90,
    price: 499,
    seatsTotal: 200,
    seatsTaken: 173,
    status: "upcoming",
  },
];

export const demoWorkshops: WorkshopSummary[] = [
  {
    slug: "weekend-react-bootcamp",
    title: "Weekend React Bootcamp",
    type: "bootcamp",
    description: "An intensive two-day hands-on bootcamp for building production React applications.",
    date: "2026-09-20",
    durationHours: 12,
  },
  {
    slug: "hands-on-docker-workshop",
    title: "Hands-On Docker Workshop",
    type: "workshop",
    description: "Containerize a real application from scratch in a guided, hands-on session.",
    date: "2026-09-25",
    durationHours: 4,
  },
  {
    slug: "live-coding-interview-prep",
    title: "Live Coding Interview Prep",
    type: "live-class",
    description: "Practice technical interview problems live with guided walkthroughs.",
    date: "2026-10-01",
    durationHours: 3,
  },
];

export const demoInstructors: InstructorSummary[] = [
  {
    slug: "demo-instructor-1",
    name: "Demo Instructor",
    expertise: "Full-Stack Development",
    bio: "Placeholder biography — real instructor profiles will be added via the admin CMS.",
    courseCount: 3,
  },
  {
    slug: "demo-instructor-2",
    name: "Demo Instructor",
    expertise: "Machine Learning & AI",
    bio: "Placeholder biography — real instructor profiles will be added via the admin CMS.",
    courseCount: 2,
  },
  {
    slug: "demo-instructor-3",
    name: "Demo Instructor",
    expertise: "Cloud & DevOps",
    bio: "Placeholder biography — real instructor profiles will be added via the admin CMS.",
    courseCount: 2,
  },
];

export const demoTestimonials: TestimonialSummary[] = [
  {
    studentName: "Demo Student",
    course: "Full-Stack Web Development",
    rating: 5,
    quote: "Placeholder testimonial text — real student reviews will populate this section once available.",
  },
  {
    studentName: "Demo Student",
    course: "Practical Machine Learning",
    rating: 5,
    quote: "Placeholder testimonial text — real student reviews will populate this section once available.",
  },
  {
    studentName: "Demo Student",
    course: "Cloud & DevOps Fundamentals",
    rating: 4,
    quote: "Placeholder testimonial text — real student reviews will populate this section once available.",
  },
];

export const demoFaqs: FaqItem[] = [
  {
    category: "courses",
    question: "How do courses on The Tech Plus work?",
    answer:
      "Each course is organized into modules and lessons that you can complete at your own pace, with progress tracked automatically.",
  },
  {
    category: "webinars",
    question: "Do I need to attend webinars live?",
    answer:
      "Live attendance lets you interact directly with the speaker. When a recording is enabled, it becomes available afterward in your dashboard.",
  },
  {
    category: "payments",
    question: "What payment methods are supported?",
    answer: "Payments are processed securely through Razorpay, supporting major cards, UPI, and net banking.",
  },
  {
    category: "access",
    question: "How long do I have access to a purchased course?",
    answer: "Once enrolled, you have ongoing access to the course content and any future updates to it.",
  },
  {
    category: "certificates",
    question: "Do I get a certificate after finishing a course?",
    answer: "Yes — a verifiable certificate is issued automatically once you complete all required lessons.",
  },
  {
    category: "account",
    question: "Can I sign in with Google?",
    answer: "Yes, you can create an account and sign in using either email/password or Google Sign-In.",
  },
  {
    category: "support",
    question: "How do I get help if I'm stuck?",
    answer: "Reach out through the Contact page and our support team will get back to you.",
  },
];
