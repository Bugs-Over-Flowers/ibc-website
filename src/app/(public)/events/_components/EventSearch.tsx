"use client";

import { Calendar, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { EventStatus } from "@/lib/events/eventUtils";

type StatusOption = {
  value: EventStatus | "all";
  label: string;
};

const statusFilters: StatusOption[] = [
  { value: "all", label: "All Events" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past Events" },
];

interface EventsSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: EventStatus | "all";
  onStatusChange: (status: EventStatus | "all") => void;
}

export function EventsSearch({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: EventsSearchProps) {
  return (
    <div className="mb-4 flex flex-col gap-4 sm:flex-row">
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-4 z-10 h-5 w-5 -translate-y-1/2 transform text-foreground/50 drop-shadow-md" />
        <Input
          className="h-[52px] justify-between rounded-xl border border-border/50 bg-background px-5 pl-12 text-foreground shadow-sm ring-1 ring-border/20 backdrop-blur-xl hover:bg-background/90 focus:ring-2 focus:ring-primary/30"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search events..."
          type="text"
          value={searchQuery}
        />

        <button
          aria-label="Filter by date"
          className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-md p-2 text-foreground/60 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          type="button"
        >
          <Calendar className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              className="h-[52px] w-[140px] justify-between rounded-xl border border-border/50 bg-background px-4 text-foreground shadow-sm ring-1 ring-border/20 backdrop-blur-xl hover:bg-background/90"
              role="combobox"
              variant="outline"
            >
              <span className="block max-w-[110px] truncate text-left">
                {statusFilters.find((s) => s.value === statusFilter)?.label ??
                  "All Events"}
              </span>

              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-[140px] rounded-xl border border-border/50 bg-background text-foreground shadow-sm backdrop-blur-xl"
          >
            <DropdownMenuItem
              className={
                statusFilter === "all" ? "bg-primary/10 text-primary" : ""
              }
              onClick={() => onStatusChange("all")}
            >
              All Events
            </DropdownMenuItem>
            <DropdownMenuItem
              className={
                statusFilter === "upcoming" ? "bg-primary/10 text-primary" : ""
              }
              onClick={() => onStatusChange("upcoming")}
            >
              Upcoming
            </DropdownMenuItem>
            <DropdownMenuItem
              className={
                statusFilter === "past" ? "bg-primary/10 text-primary" : ""
              }
              onClick={() => onStatusChange("past")}
            >
              Past Events
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
