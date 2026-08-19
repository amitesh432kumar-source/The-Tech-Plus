"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";

export async function moderateReviewAction(reviewId: string, status: "approved" | "rejected") {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("reviews").update({ status }).eq("id", reviewId);
  revalidatePath("/admin/reviews");
}
