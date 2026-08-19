"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";

export interface ReviewState {
  error?: string;
  success?: boolean;
}

export async function submitReviewAction(
  courseId: string,
  courseSlug: string,
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const user = await requireUser();
  const supabase = await createClient();

  const rating = Number(formData.get("rating") ?? 0);
  const reviewText = String(formData.get("reviewText") ?? "").trim();

  if (rating < 1 || rating > 5) return { error: "Choose a rating from 1 to 5." };

  const { error } = await supabase.from("reviews").insert({
    student_id: user.id,
    course_id: courseId,
    rating,
    review_text: reviewText || null,
  });

  if (error) {
    if (error.code === "23505") return { error: "You've already reviewed this course." };
    return { error: "You need to be enrolled in this course to review it." };
  }

  revalidatePath(`/courses/${courseSlug}`);
  return { success: true };
}
