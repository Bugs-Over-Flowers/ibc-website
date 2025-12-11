"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <div className="flex flex-col gap-4 sm:flex-row">
      {/* Search */}
      <Input
        defaultValue={searchParams.get("search") || ""}
        placeholder="Search title or venue..."
        onChange={(e) => updateFilters("search", e.target.value)}
        className="sm:flex-1"
      />

      {/* Sort */}
      <Select
        defaultValue={searchParams.get("sort") || "date-asc"}
        onValueChange={(value) => updateFilters("sort", value)}
      >
        <SelectTrigger className="sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date-asc">Date ↑</SelectItem>
          <SelectItem value="date-desc">Date ↓</SelectItem>
          <SelectItem value="title-asc">Title A → Z</SelectItem>
          <SelectItem value="title-desc">Title Z → A</SelectItem>
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select
        defaultValue={searchParams.get("status") || "all"}
        onValueChange={(value) =>
          updateFilters("status", value === "all" ? "" : value)
        }
      >
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="finished">Finished</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
