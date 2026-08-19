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

function eventFieldsFromForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();

  return {
    title,
    slug: slugInput ? slugify(slugInput) : slugify(title),
    type: String(formData.get("type") ?? "workshop"),
    description: String(formData.get("description") ?? "").trim() || null,
    scheduled_date: String(formData.get("scheduledDate") ?? ""),
    duration_hours: Number(formData.get("durationHours") ?? 1),
    price: Number(formData.get("price") ?? 0),
    max_seats: Number(formData.get("maxSeats") ?? 50),
    status: String(formData.get("status") ?? "draft"),
    meeting_url: String(formData.get("meetingUrl") ?? "").trim() || null,
    recording_url: String(formData.get("recordingUrl") ?? "").trim() || null,
  };
}

export async function createEventAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireRole("admin");
  const admin = createAdminClient();

  const fields = eventFieldsFromForm(formData);
  if (!fields.title) return { error: "Title is required." };
  if (!fields.scheduled_date) return { error: "Date is required." };

  const { data, error } = await admin.from("events").insert(fields).select("id").single();
  if (error) return { error: "Could not create event." };

  revalidatePath("/admin/workshops");
  redirect(`/admin/workshops/${data.id}/edit`);
}

export async function updateEventAction(
  eventId: string,
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireRole("admin");
  const admin = createAdminClient();

  const fields = eventFieldsFromForm(formData);
  if (!fields.title) return { error: "Title is required." };

  const { error } = await admin.from("events").update(fields).eq("id", eventId);
  if (error) return { error: "Could not save event." };

  revalidatePath("/admin/workshops");
  revalidatePath(`/admin/workshops/${eventId}/edit`);
  return { success: true };
}

export async function deleteEventAction(eventId: string) {
  await requireRole("admin");
  const admin = createAdminClient();
  await admin.from("events").delete().eq("id", eventId);
  revalidatePath("/admin/workshops");
}
