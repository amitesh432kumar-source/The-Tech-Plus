import { createClient } from "@/lib/supabase/server";
import type { WebinarDetail, WebinarStatus, WebinarSummary } from "@/types/content";
import type { Tables } from "@/types/database";

type WebinarRow = Tables<"webinars">;

async function countSeats(webinarId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("webinar_registrations")
    .select("id", { count: "exact", head: true })
    .eq("webinar_id", webinarId);
  return count ?? 0;
}

function toSummary(row: WebinarRow, seatsTaken: number): WebinarSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    speaker: row.speaker_name ?? "The Tech Plus",
    date: row.scheduled_date,
    time: row.scheduled_time,
    durationMinutes: row.duration_minutes,
    price: row.price > 0 ? row.price : "free",
    seatsTotal: row.max_seats,
    seatsTaken,
    status: row.status as WebinarStatus,
  };
}

export async function listUpcomingWebinars(limit = 3): Promise<WebinarSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("webinars")
    .select("*")
    .in("status", ["upcoming", "live"])
    .order("scheduled_date", { ascending: true })
    .limit(limit);

  if (error || !data) return [];

  return Promise.all(data.map(async (row) => toSummary(row, await countSeats(row.id))));
}

export async function listWebinars(): Promise<WebinarSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("webinars")
    .select("*")
    .neq("status", "draft")
    .order("scheduled_date", { ascending: true });

  if (error || !data) return [];

  return Promise.all(data.map(async (row) => toSummary(row, await countSeats(row.id))));
}

export async function getWebinarBySlug(slug: string): Promise<WebinarDetail | null> {
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("webinars")
    .select("*")
    .eq("slug", slug)
    .neq("status", "draft")
    .single();

  if (error || !row) return null;

  const seatsTaken = await countSeats(row.id);

  return {
    ...toSummary(row, seatsTaken),
    speakerBio: row.speaker_bio,
    timezone: row.timezone,
    meetingUrl: row.meeting_url,
    recordingUrl: row.recording_url,
  };
}

export async function isRegisteredForWebinar(webinarId: string, studentId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("webinar_registrations")
    .select("id")
    .eq("webinar_id", webinarId)
    .eq("student_id", studentId)
    .maybeSingle();
  return !!data;
}
