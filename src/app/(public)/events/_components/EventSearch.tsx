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
  { value: "past", label: "Past" },
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
          className="h-12 rounded-xl border-border bg-background pr-4 pl-12"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search events..."
          type="text"
          value={searchQuery}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(triggerProps) => (
              <Button
                aria-expanded={false}
                className="h-[52px] w-full min-w-[140px] justify-between rounded-xl border-border/50 bg-white px-5 shadow-lg ring-1 ring-white/30 backdrop-blur-xl hover:bg-white/90"
                role="combobox"
                variant="outline"
                {...triggerProps}
              >
                <span className="block max-w-[140px] truncate text-left">
                  {filterLabels[currentFilter]}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            )}
          />
          <DropdownMenuContent
            align="end"
            className="w-[140px] rounded-xl border-border/50 bg-white/95 shadow-xl backdrop-blur-xl"
          >
            <DropdownMenuItem
              className={
                currentFilter === "all" ? "bg-primary/10 text-primary" : ""
              }
              onClick={() => onFilterChange("all")}
            >
              All Events
            </DropdownMenuItem>
            <DropdownMenuItem
              className={
                currentFilter === "upcoming" ? "bg-primary/10 text-primary" : ""
              }
              onClick={() => onFilterChange("upcoming")}
            >
              Upcoming
            </DropdownMenuItem>
            <DropdownMenuItem
              className={
                currentFilter === "past" ? "bg-primary/10 text-primary" : ""
              }
              onClick={() => onFilterChange("past")}
            >
              Past Events
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
