import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { WebinarDetail, WebinarStatus, WebinarSummary } from "@/types/content";
import type { Tables } from "@/types/database";

type WebinarRow = Omit<Tables<"webinars">, "meeting_url" | "recording_url">;

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

const PUBLIC_COLUMNS =
  "id, slug, title, description, speaker_name, speaker_bio, image_url, scheduled_date, scheduled_time, timezone, duration_minutes, price, max_seats, status, created_at, updated_at";

export async function listUpcomingWebinars(limit = 3): Promise<WebinarSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("webinars")
    .select(PUBLIC_COLUMNS)
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
    .select(PUBLIC_COLUMNS)
    .neq("status", "draft")
    .order("scheduled_date", { ascending: true });

  if (error || !data) return [];

  return Promise.all(data.map(async (row) => toSummary(row, await countSeats(row.id))));
}

export async function getWebinarBySlug(slug: string): Promise<WebinarDetail | null> {
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("webinars")
    .select(PUBLIC_COLUMNS)
    .eq("slug", slug)
    .neq("status", "draft")
    .single();

  if (error || !row) return null;

  const seatsTaken = await countSeats(row.id);

  return {
    ...toSummary(row, seatsTaken),
    speakerBio: row.speaker_bio,
    timezone: row.timezone,
    // Meeting/recording links are withheld from the public read (see
    // migration 0008) — only attached via getWebinarAccessLinks below,
    // after the caller is confirmed registered or admin.
    meetingUrl: null,
    recordingUrl: null,
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

/** Meeting/recording links — call only after verifying registration or admin. */
export async function getWebinarAccessLinks(webinarId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("webinars")
    .select("meeting_url, recording_url")
    .eq("id", webinarId)
    .single();
  return { meetingUrl: data?.meeting_url ?? null, recordingUrl: data?.recording_url ?? null };
}

export interface MyWebinarRegistration {
  registrationId: string;
  webinar: WebinarSummary;
}

export async function listMyWebinarRegistrations(studentId: string): Promise<MyWebinarRegistration[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("webinar_registrations")
    .select(`id, webinars(${PUBLIC_COLUMNS})`)
    .eq("student_id", studentId)
    .order("registered_at", { ascending: false });

  if (error || !data) return [];

  const results: MyWebinarRegistration[] = [];
  for (const r of data) {
    const w = r.webinars as unknown as WebinarRow | null;
    if (!w) continue;
    results.push({ registrationId: r.id, webinar: toSummary(w, await countSeats(w.id)) });
  }
  return results;
}
