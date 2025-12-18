"use client";

import { Filter, Search, SortAsc } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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

  // Local state for search input to prevent laggy typing (TOOK ME 2HOURS TO FIX IT)
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || "",
  );
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateFilters = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`${pathname}?${params.toString()}` as Route);
    },
    [searchParams, pathname, router],
  );

  // Update local state when URL changes
  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);

  // Handle search input change with debouncing (DEBOUNCING ANG TERM)
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Update URL with debouncing
      timeoutRef.current = setTimeout(() => {
        updateFilters("search", value || null);
      }, 300);
    },
    [updateFilters],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-6 gap-3 md:gap-4">
      <div className="relative col-span-4">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-foreground" />
        <Input
          autoComplete="off"
          className="w-full border-border pl-10"
          data-form-type="other"
          data-lpignore="true"
          name="event-search"
          onChange={handleSearchChange}
          placeholder="Search title or venue..."
          value={searchValue}
        />
      </div>

      <div className="col-span-1">
        <Select
          onValueChange={(value) => updateFilters("sort", value)}
          value={searchParams.get("sort") || "date-asc"}
        >
          <SelectTrigger className="w-full border-border">
            <div className="flex items-center gap-2">
              <SortAsc size={16} />
              <span className="hidden md:inline">
                <SelectValue />
              </span>
              <span className="md:hidden">Sort</span>
            </div>
          </SelectTrigger>
          <SelectContent className="w-auto">
            <SelectItem value="date-asc">Date (Ascending)</SelectItem>
            <SelectItem value="date-desc">Date (Descending)</SelectItem>
            <SelectItem value="title-asc">Title (A → Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z → A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-1">
        <Select
          onValueChange={(value) =>
            updateFilters("status", value === "all" ? "" : value)
          }
          value={searchParams.get("status") || "all"}
        >
          <SelectTrigger className="w-full border-border">
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <span className="hidden md:inline">
                <SelectValue />
              </span>
              <span className="md:hidden">Filter</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="finished">Finished</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
