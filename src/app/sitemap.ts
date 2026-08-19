import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/courses",
    "/webinars",
    "/workshops",
    "/about",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
  }));

  const supabase = await createClient();

  const [courses, webinars, events] = await Promise.all([
    supabase.from("courses").select("slug, updated_at").eq("status", "published"),
    supabase.from("webinars").select("slug, updated_at").neq("status", "draft"),
    supabase.from("events").select("slug, updated_at").neq("status", "draft"),
  ]);

  const dynamicRoutes = [
    ...(courses.data ?? []).map((c) => ({
      url: `${siteConfig.url}/courses/${c.slug}`,
      lastModified: new Date(c.updated_at),
    })),
    ...(webinars.data ?? []).map((w) => ({
      url: `${siteConfig.url}/webinars/${w.slug}`,
      lastModified: new Date(w.updated_at),
    })),
    ...(events.data ?? []).map((e) => ({
      url: `${siteConfig.url}/workshops/${e.slug}`,
      lastModified: new Date(e.updated_at),
    })),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
