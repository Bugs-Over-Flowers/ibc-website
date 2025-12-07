"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  function updateFilters(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}` as any);
  }

  return (
    <div className="flex gap-4">
      {/* Search */}
      <input
        defaultValue={searchParams.get("search") || ""}
        placeholder="Search title or venue..."
        onChange={(e) => updateFilters("search", e.target.value)}
        className="border p-2 rounded"
      />

      {/* Sort */}
      <select
        defaultValue={searchParams.get("sort") || "date-asc"}
        onChange={(e) => updateFilters("sort", e.target.value)}
        className="border p-2 rounded"
      >
        <option value="date-asc">Date ↑</option>
        <option value="date-desc">Date ↓</option>
        <option value="title-asc">Title A → Z</option>
        <option value="title-desc">Title Z → A</option>
      </select>

      {/* Status filter */}
      <select
        defaultValue={searchParams.get("status") || ""}
        onChange={(e) => updateFilters("status", e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">All</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="finished">Finished</option>
      </select>
    </div>
  );
}
