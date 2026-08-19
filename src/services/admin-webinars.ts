import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminWebinarListItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  scheduledDate: string;
  price: number;
}

export async function listAdminWebinars(): Promise<AdminWebinarListItem[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("webinars")
    .select("id, slug, title, status, scheduled_date, price")
    .order("scheduled_date", { ascending: false });

  return (data ?? []).map((w) => ({
    id: w.id,
    slug: w.slug,
    title: w.title,
    status: w.status,
    scheduledDate: w.scheduled_date,
    price: w.price,
  }));
}

export interface AdminWebinarEditData {
  id: string;
  slug: string;
  title: string;
  description: string;
  speakerName: string;
  speakerBio: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  price: number;
  maxSeats: number;
  status: string;
  meetingUrl: string;
  recordingUrl: string;
}

export async function getAdminWebinarForEdit(webinarId: string): Promise<AdminWebinarEditData | null> {
  const admin = createAdminClient();
  const { data: w } = await admin.from("webinars").select("*").eq("id", webinarId).single();
  if (!w) return null;

  return {
    id: w.id,
    slug: w.slug,
    title: w.title,
    description: w.description ?? "",
    speakerName: w.speaker_name ?? "",
    speakerBio: w.speaker_bio ?? "",
    scheduledDate: w.scheduled_date,
    scheduledTime: w.scheduled_time,
    durationMinutes: w.duration_minutes,
    price: w.price,
    maxSeats: w.max_seats,
    status: w.status,
    meetingUrl: w.meeting_url ?? "",
    recordingUrl: w.recording_url ?? "",
  };
}
