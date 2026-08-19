import { createClient } from "@/lib/supabase/server";
import type { WebinarStatus, WorkshopDetail, WorkshopSummary, WorkshopType } from "@/types/content";
import type { Tables } from "@/types/database";

type EventRow = Tables<"events">;

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

export async function listUpcomingWorkshops(limit = 3): Promise<WorkshopSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
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
    .select("*")
    .neq("status", "draft")
    .order("scheduled_date", { ascending: true });

  if (error || !data) return [];

  return Promise.all(data.map(async (row) => toSummary(row, await countSeats(row.id))));
}

export async function getWorkshopBySlug(slug: string): Promise<WorkshopDetail | null> {
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .neq("status", "draft")
    .single();

  if (error || !row) return null;

  const seatsTaken = await countSeats(row.id);

  return {
    ...toSummary(row, seatsTaken),
    meetingUrl: row.meeting_url,
    recordingUrl: row.recording_url,
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
