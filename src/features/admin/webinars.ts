"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/session";
import type { AdminFormState } from "@/features/admin/courses";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function webinarFieldsFromForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();

  return {
    title,
    slug: slugInput ? slugify(slugInput) : slugify(title),
    description: String(formData.get("description") ?? "").trim() || null,
    speaker_name: String(formData.get("speakerName") ?? "").trim() || null,
    speaker_bio: String(formData.get("speakerBio") ?? "").trim() || null,
    scheduled_date: String(formData.get("scheduledDate") ?? ""),
    scheduled_time: String(formData.get("scheduledTime") ?? "").trim(),
    duration_minutes: Number(formData.get("durationMinutes") ?? 60),
    price: Number(formData.get("price") ?? 0),
    max_seats: Number(formData.get("maxSeats") ?? 100),
    status: String(formData.get("status") ?? "draft"),
    meeting_url: String(formData.get("meetingUrl") ?? "").trim() || null,
    recording_url: String(formData.get("recordingUrl") ?? "").trim() || null,
  };
}

// Uses the service-role client throughout: meeting_url/recording_url are
// withheld from the authenticated role at the column-grant level
// (migration 0008), so both reading current values for the edit form and
// (for consistency) writing them go through the admin client.

export async function createWebinarAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireRole("admin");
  const admin = createAdminClient();

  const fields = webinarFieldsFromForm(formData);
  if (!fields.title) return { error: "Title is required." };
  if (!fields.scheduled_date) return { error: "Date is required." };

  const { data, error } = await admin.from("webinars").insert(fields).select("id").single();
  if (error) return { error: "Could not create webinar." };

  revalidatePath("/admin/webinars");
  redirect(`/admin/webinars/${data.id}/edit`);
}

export async function updateWebinarAction(
  webinarId: string,
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireRole("admin");
  const admin = createAdminClient();

  const fields = webinarFieldsFromForm(formData);
  if (!fields.title) return { error: "Title is required." };

  const { error } = await admin.from("webinars").update(fields).eq("id", webinarId);
  if (error) return { error: "Could not save webinar." };

  revalidatePath("/admin/webinars");
  revalidatePath(`/admin/webinars/${webinarId}/edit`);
  return { success: true };
}

export async function deleteWebinarAction(webinarId: string) {
  await requireRole("admin");
  const admin = createAdminClient();
  await admin.from("webinars").delete().eq("id", webinarId);
  revalidatePath("/admin/webinars");
}
