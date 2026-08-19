import { createClient } from "@/lib/supabase/server";

export interface SearchResultItem {
  type: "course" | "webinar" | "workshop";
  title: string;
  href: string;
  subtitle: string;
}

export async function searchAll(query: string, limitPerType = 5): Promise<SearchResultItem[]> {
  const q = query.trim();
  if (!q) return [];

  const supabase = await createClient();

  const [courses, webinars, events] = await Promise.all([
    supabase
      .from("courses")
      .select("slug, title, short_description")
      .eq("status", "published")
      .ilike("title", `%${q}%`)
      .limit(limitPerType),
    supabase
      .from("webinars")
      .select("slug, title, scheduled_date")
      .neq("status", "draft")
      .ilike("title", `%${q}%`)
      .limit(limitPerType),
    supabase
      .from("events")
      .select("slug, title, scheduled_date")
      .neq("status", "draft")
      .ilike("title", `%${q}%`)
      .limit(limitPerType),
  ]);

  const results: SearchResultItem[] = [];

  for (const c of courses.data ?? []) {
    results.push({
      type: "course",
      title: c.title,
      href: `/courses/${c.slug}`,
      subtitle: c.short_description ?? "Course",
    });
  }
  for (const w of webinars.data ?? []) {
    results.push({
      type: "webinar",
      title: w.title,
      href: `/webinars/${w.slug}`,
      subtitle: `Webinar · ${new Date(w.scheduled_date).toLocaleDateString("en-IN")}`,
    });
  }
  for (const e of events.data ?? []) {
    results.push({
      type: "workshop",
      title: e.title,
      href: `/workshops/${e.slug}`,
      subtitle: `Workshop · ${new Date(e.scheduled_date).toLocaleDateString("en-IN")}`,
    });
  }

  return results;
}
