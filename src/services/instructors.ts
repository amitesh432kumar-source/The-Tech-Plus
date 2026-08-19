import { createClient } from "@/lib/supabase/server";
import type { InstructorSummary } from "@/types/content";

export async function listInstructors(limit = 3): Promise<InstructorSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("instructors")
    .select("id, display_name, expertise, bio, profiles(full_name), courses(id)")
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.display_name ?? (row.profiles as { full_name: string | null } | null)?.full_name ?? "Instructor",
    expertise: row.expertise ?? "",
    bio: row.bio ?? "",
    courseCount: Array.isArray(row.courses) ? row.courses.length : 0,
  }));
}
