"use client";

import { Filter, Search, SortAsc } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  function updateFilters(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}` as Route);
  }

  return (
    <div className="grid grid-cols-6 gap-3 md:gap-4">
      <div className="col-span-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-foreground" />
              <Input
                autoComplete="off"
                className="w-full border-border pl-10"
                data-form-type="other"
                data-lpignore="true"
                defaultValue={searchParams.get("search") || ""}
                name="event-search"
                onChange={(e) => updateFilters("search", e.target.value)} // Prevents LastPass from modifying
                placeholder="Search title or venue..." // Prevents browser form detection
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            Search events by title or venue
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="col-span-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Select
                defaultValue={searchParams.get("sort") || "date-asc"}
                onValueChange={(value) => updateFilters("sort", value)}
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
                <SelectContent>
                  <SelectItem value="date-asc">Date ↑</SelectItem>
                  <SelectItem value="date-desc">Date ↓</SelectItem>
                  <SelectItem value="title-asc">Title A → Z</SelectItem>
                  <SelectItem value="title-desc">Title Z → A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            Sort events by date or title
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="col-span-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Select
                defaultValue={searchParams.get("status") || "all"}
                onValueChange={(value) =>
                  updateFilters("status", value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-full border-border">
                  <div className="flex items-center gap-2">
                    <Filter size={16} />
                    <span className="hidden md:inline">
                      <SelectValue placeholder="All Status" />
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
          </TooltipTrigger>
          <TooltipContent side="top">Filter events by status</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
