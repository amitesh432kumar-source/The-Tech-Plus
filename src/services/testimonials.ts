import { createClient } from "@/lib/supabase/server";
import type { TestimonialSummary } from "@/types/content";

export async function listApprovedTestimonials(limit = 6): Promise<TestimonialSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select("student_name, course_title, rating, quote")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    studentName: row.student_name,
    course: row.course_title ?? "",
    rating: row.rating,
    quote: row.quote,
  }));
}
