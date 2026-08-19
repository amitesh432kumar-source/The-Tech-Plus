import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { WebinarStatus, WorkshopDetail, WorkshopSummary, WorkshopType } from "@/types/content";
import type { Tables } from "@/types/database";

type EventRow = Omit<Tables<"events">, "meeting_url" | "recording_url">;

async function countSeats(eventId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("event_registrations")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId);
  return count ?? 0;
}

function toSummary(row: EventRow, seatsTaken: number): WorkshopSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type as WorkshopType,
    description: row.description ?? "",
    date: row.scheduled_date,
    durationHours: row.duration_hours,
    price: row.price > 0 ? row.price : "free",
    seatsTotal: row.max_seats,
    seatsTaken,
    status: row.status as WebinarStatus,
  };
}

const PUBLIC_COLUMNS =
  "id, slug, title, type, description, image_url, scheduled_date, duration_hours, price, max_seats, status, created_at, updated_at";

export async function listUpcomingWorkshops(limit = 3): Promise<WorkshopSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select(PUBLIC_COLUMNS)
    .in("status", ["upcoming", "live"])
    .order("scheduled_date", { ascending: true })
    .limit(limit);

  if (error || !data) return [];

  return Promise.all(data.map(async (row) => toSummary(row, await countSeats(row.id))));
}

export async function listWorkshops(): Promise<WorkshopSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select(PUBLIC_COLUMNS)
    .neq("status", "draft")
    .order("scheduled_date", { ascending: true });

  if (error || !data) return [];

  return Promise.all(data.map(async (row) => toSummary(row, await countSeats(row.id))));
}

export async function getWorkshopBySlug(slug: string): Promise<WorkshopDetail | null> {
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("events")
    .select(PUBLIC_COLUMNS)
    .eq("slug", slug)
    .neq("status", "draft")
    .single();

  if (error || !row) return null;

  const seatsTaken = await countSeats(row.id);

  return {
    ...toSummary(row, seatsTaken),
    // Withheld from public read (migration 0008) — see getEventAccessLinks.
    meetingUrl: null,
    recordingUrl: null,
  };
}

export async function isRegisteredForEvent(eventId: string, studentId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("event_registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("student_id", studentId)
    .maybeSingle();
  return !!data;
}

/** Meeting/recording links — call only after verifying registration or admin. */
export async function getEventAccessLinks(eventId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("events")
    .select("meeting_url, recording_url")
    .eq("id", eventId)
    .single();
  return { meetingUrl: data?.meeting_url ?? null, recordingUrl: data?.recording_url ?? null };
}

export interface MyEventRegistration {
  registrationId: string;
  event: WorkshopSummary;
}

export async function listMyEventRegistrations(studentId: string): Promise<MyEventRegistration[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_registrations")
    .select(`id, events(${PUBLIC_COLUMNS})`)
    .eq("student_id", studentId)
    .order("registered_at", { ascending: false });

  if (error || !data) return [];

  const results: MyEventRegistration[] = [];
  for (const r of data) {
    const e = r.events as unknown as EventRow | null;
    if (!e) continue;
    results.push({ registrationId: r.id, event: toSummary(e, await countSeats(e.id)) });
  }
  return results;
}
