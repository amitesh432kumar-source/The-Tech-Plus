import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminEventListItem {
  id: string;
  slug: string;
  title: string;
  type: string;
  status: string;
  scheduledDate: string;
  price: number;
}

export async function listAdminEvents(): Promise<AdminEventListItem[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("events")
    .select("id, slug, title, type, status, scheduled_date, price")
    .order("scheduled_date", { ascending: false });

  return (data ?? []).map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    type: e.type,
    status: e.status,
    scheduledDate: e.scheduled_date,
    price: e.price,
  }));
}

export interface AdminEventEditData {
  id: string;
  slug: string;
  title: string;
  type: string;
  description: string;
  scheduledDate: string;
  durationHours: number;
  price: number;
  maxSeats: number;
  status: string;
  meetingUrl: string;
  recordingUrl: string;
}

export async function getAdminEventForEdit(eventId: string): Promise<AdminEventEditData | null> {
  const admin = createAdminClient();
  const { data: e } = await admin.from("events").select("*").eq("id", eventId).single();
  if (!e) return null;

  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    type: e.type,
    description: e.description ?? "",
    scheduledDate: e.scheduled_date,
    durationHours: e.duration_hours,
    price: e.price,
    maxSeats: e.max_seats,
    status: e.status,
    meetingUrl: e.meeting_url ?? "",
    recordingUrl: e.recording_url ?? "",
  };
}
