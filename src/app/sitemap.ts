import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * Static top-level routes for now. Course/webinar detail pages will be
 * appended here dynamically from the database in a later phase.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/courses",
    "/webinars",
    "/workshops",
    "/about",
    "/contact",
    "/faq",
  ];

  return staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
  }));
}
