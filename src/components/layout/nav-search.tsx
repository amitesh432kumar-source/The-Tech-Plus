"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SearchResultItem } from "@/services/search";

const typeLabel: Record<SearchResultItem["type"], string> = {
  course: "Course",
  webinar: "Webinar",
  workshop: "Workshop",
};

export function NavSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function submitSearch() {
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Search"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-4" /> : <Search className="size-4" />}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch();
            }}
          >
            <Input
              autoFocus
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Search courses, webinars, workshops…"
            />
          </form>

          <div className="mt-2 max-h-80 overflow-y-auto">
            {loading && <p className="px-1 py-2 text-xs text-muted-foreground">Searching…</p>}
            {!loading && query && results.length === 0 && (
              <p className="px-1 py-2 text-xs text-muted-foreground">No results for &quot;{query}&quot;.</p>
            )}
            {results.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-2 py-2 text-sm hover:bg-muted"
              >
                <p className="font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {typeLabel[r.type]} · {r.subtitle}
                </p>
              </Link>
            ))}
            {results.length > 0 && (
              <button
                onClick={submitSearch}
                className="mt-1 w-full rounded-lg px-2 py-2 text-left text-xs font-medium text-[var(--brand-blue)] hover:bg-muted"
              >
                View all results for &quot;{query}&quot;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
