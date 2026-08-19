"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const LEVELS = [
  { value: "", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const SORTS = [
  { value: "", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function CourseFilters({
  categories,
}: {
  categories: { name: string; slug: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/courses?${params.toString()}`);
  }

  function handleSearchChange(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam("q", value), 350);
  }

  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:min-w-[220px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search courses…"
          className="pl-9"
          aria-label="Search courses"
        />
      </div>

      <select
        defaultValue={searchParams.get("category") ?? ""}
        onChange={(e) => updateParam("category", e.target.value)}
        aria-label="Filter by category"
        className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get("level") ?? ""}
        onChange={(e) => updateParam("level", e.target.value)}
        aria-label="Filter by level"
        className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {LEVELS.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get("sort") ?? ""}
        onChange={(e) => updateParam("sort", e.target.value)}
        aria-label="Sort courses"
        className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
