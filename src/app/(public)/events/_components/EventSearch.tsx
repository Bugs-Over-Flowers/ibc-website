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
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full flex-1">
        <Search className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-muted-foreground" />
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
          <DropdownMenuTrigger asChild>
            <Button
              className="h-12 w-48 min-w-[10rem] gap-2 rounded-xl bg-transparent"
              variant="outline"
            >
              <Calendar className="h-4 w-4" />
              {statusFilters.find((s) => s.value === statusFilter)?.label}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            {statusFilters.map((status) => (
              <DropdownMenuItem
                className={statusFilter === status.value ? "bg-primary/10" : ""}
                key={status.value}
                onClick={() => onStatusChange(status.value)}
              >
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
