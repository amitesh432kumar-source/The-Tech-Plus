import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/marketing/page-header";
import { Badge } from "@/components/ui/badge";
import { searchAll, type SearchResultItem } from "@/services/search";

export const metadata: Metadata = {
  title: "Search",
  description: "Search courses, webinars, and workshops on The Tech Plus.",
};

const typeLabel: Record<SearchResultItem["type"], string> = {
  course: "Course",
  webinar: "Webinar",
  workshop: "Workshop",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const results = q ? await searchAll(q, 20) : [];

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title={q ? `Results for “${q}”` : "Search The Tech Plus"}
        description={
          q
            ? `${results.length} ${results.length === 1 ? "result" : "results"} found.`
            : "Search across courses, webinars, and workshops."
        }
      />
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {!q ? (
          <p className="text-center text-muted-foreground">
            Use the search icon in the navigation bar to start searching.
          </p>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
            No results found for &quot;{q}&quot;. Try a different search term.
          </div>
        ) : (
          <ul className="space-y-3">
            {results.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="card-hover block rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{r.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{r.subtitle}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {typeLabel[r.type]}
                    </Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
