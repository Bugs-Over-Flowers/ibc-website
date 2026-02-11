"use client";

import { subDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronDown,
  Filter,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SponsoredRegistrationWithEvent } from "@/server/sponsored-registrations/queries/getAllSponsoredRegistrations";

export interface DateRange {
  from?: Date;
  to?: Date;
}

type DatePreset =
  | "all"
  | "last7Days"
  | "last14Days"
  | "last30Days"
  | "last90Days";

type StatusOption = "all" | "active" | "disabled" | "full";

const statusLabels: Record<StatusOption, string> = {
  all: "All Status",
  active: "Active",
  disabled: "Disabled",
  full: "Full",
};

const datePresetLabels: Record<DatePreset, string> = {
  all: "All Dates",
  last7Days: "Last 7 Days",
  last14Days: "Last 14 Days",
  last30Days: "Last 30 Days",
  last90Days: "Last 90 Days",
};

const getDateRangeFromPreset = (preset: DatePreset): DateRange => {
  const today = new Date();

  switch (preset) {
    case "last7Days":
      return { from: subDays(today, 7), to: today };
    case "last14Days":
      return { from: subDays(today, 14), to: today };
    case "last30Days":
      return { from: subDays(today, 30), to: today };
    case "last90Days":
      return { from: subDays(today, 90), to: today };
    default:
      return { from: undefined, to: undefined };
  }
};

interface SponsoredRegistrationFilterProps {
  registrations: SponsoredRegistrationWithEvent[];
  onFilter: (filtered: SponsoredRegistrationWithEvent[]) => void;
}

export function SponsoredRegistrationFilter({
  registrations,
  onFilter,
}: SponsoredRegistrationFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<StatusOption>("all");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [selectedDatePreset, setSelectedDatePreset] =
    useState<DatePreset>("all");

  const uniqueEvents = Array.from(
    new Set(
      registrations
        .map((r) => r.eventTitle)
        .filter((name): name is string => name !== null && name !== undefined),
    ),
  ).sort();

  const applyFilters = useCallback(() => {
    let filtered = registrations;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.sponsoredBy.toLowerCase().includes(term) ||
          r.eventTitle?.toLowerCase().includes(term) ||
          r.eventName?.toLowerCase().includes(term) ||
          r.uuid.toLowerCase().includes(term),
      );
    }

    // Event filter
    if (selectedEvent) {
      filtered = filtered.filter(
        (r) => (r.eventTitle || r.eventName) === selectedEvent,
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((r) => r.status === selectedStatus);
    }

    // Date filter
    if (selectedDatePreset !== "all") {
      const dateRange = getDateRangeFromPreset(selectedDatePreset);
      if (dateRange.from) {
        const fromDate = dateRange.from;
        filtered = filtered.filter((r) => new Date(r.createdAt) >= fromDate);
      }
      if (dateRange.to) {
        const endDate = new Date(dateRange.to);
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter((r) => new Date(r.createdAt) <= endDate);
      }
    }

    // Sort by date
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

    onFilter(filtered);
  }, [
    searchTerm,
    selectedEvent,
    selectedStatus,
    sortOrder,
    selectedDatePreset,
    registrations,
    onFilter,
  ]);

  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setSelectedEvent("");
    setSelectedStatus("all");
    setSortOrder("latest");
    setSelectedDatePreset("all");
  };

  const hasActiveFilters =
    searchTerm ||
    selectedEvent ||
    selectedStatus !== "all" ||
    selectedDatePreset !== "all" ||
    sortOrder !== "latest";

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex flex-col gap-3">
        {/* Search Bar */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-muted-foreground/70" />
          </div>
          <Input
            className="h-10 rounded-xl border-border/40 bg-background/80 pr-12 pl-12 text-base transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-primary/20"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by sponsor name, event, or registration UUID..."
            type="text"
            value={searchTerm}
          />
          <AnimatePresence>
            {searchTerm && (
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-y-0 right-2 flex items-center"
                exit={{ opacity: 0, scale: 0.8 }}
                initial={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  className="h-8 w-8 rounded-full hover:bg-muted/60"
                  onClick={() => setSearchTerm("")}
                  size="icon"
                  variant="ghost"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Date Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex h-10 min-w-[160px] items-center justify-between gap-2 rounded-xl border border-border/40 bg-background/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                selectedDatePreset !== "all" &&
                  "border-primary/40 bg-primary/5",
              )}
            >
              <div className="flex items-center gap-2">
                <CalendarIcon
                  className={cn(
                    "h-4 w-4",
                    selectedDatePreset !== "all"
                      ? "text-primary"
                      : "text-muted-foreground/70",
                  )}
                />
                <span
                  className={cn(
                    "text-sm",
                    selectedDatePreset !== "all"
                      ? "text-foreground"
                      : "text-muted-foreground/70",
                  )}
                >
                  {datePresetLabels[selectedDatePreset]}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[180px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
            >
              {(Object.keys(datePresetLabels) as DatePreset[]).map((preset) => (
                <DropdownMenuItem
                  className={cn(
                    "cursor-pointer rounded-lg text-sm transition-colors",
                    selectedDatePreset === preset
                      ? "bg-primary/10 font-medium text-primary"
                      : "hover:bg-muted/50",
                  )}
                  key={preset}
                  onClick={() => setSelectedDatePreset(preset)}
                >
                  {datePresetLabels[preset]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Event Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex h-10 min-w-[160px] items-center justify-between gap-2 rounded-xl border border-border/40 bg-background/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                selectedEvent && "border-primary/40 bg-primary/5",
              )}
            >
              <div className="flex items-center gap-2">
                <Filter
                  className={cn(
                    "h-4 w-4",
                    selectedEvent ? "text-primary" : "text-muted-foreground/70",
                  )}
                />
                <span
                  className={cn(
                    "text-sm",
                    selectedEvent
                      ? "text-foreground"
                      : "text-muted-foreground/70",
                  )}
                >
                  {selectedEvent || "All Events"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[200px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
            >
              <DropdownMenuItem
                className={cn(
                  "cursor-pointer rounded-lg text-sm transition-colors",
                  selectedEvent === ""
                    ? "bg-primary/10 font-medium text-primary"
                    : "hover:bg-muted/50",
                )}
                onClick={() => setSelectedEvent("")}
              >
                All Events
              </DropdownMenuItem>
              {uniqueEvents.map((event) => (
                <DropdownMenuItem
                  className={cn(
                    "cursor-pointer rounded-lg text-sm transition-colors",
                    selectedEvent === event
                      ? "bg-primary/10 font-medium text-primary"
                      : "hover:bg-muted/50",
                  )}
                  key={event}
                  onClick={() => setSelectedEvent(event)}
                >
                  {event}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex h-10 min-w-[160px] items-center justify-between gap-2 rounded-xl border border-border/40 bg-background/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                selectedStatus !== "all" && "border-primary/40 bg-primary/5",
              )}
            >
              <div className="flex items-center gap-2">
                {selectedStatus === "active" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : selectedStatus === "full" ? (
                  <XCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <Filter
                    className={cn(
                      "h-4 w-4",
                      selectedStatus !== "all"
                        ? "text-primary"
                        : "text-muted-foreground/70",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "text-sm",
                    selectedStatus !== "all"
                      ? "text-foreground"
                      : "text-muted-foreground/70",
                  )}
                >
                  {statusLabels[selectedStatus]}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[160px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
            >
              {(Object.keys(statusLabels) as StatusOption[]).map((status) => (
                <DropdownMenuItem
                  className={cn(
                    "cursor-pointer rounded-lg text-sm transition-colors",
                    selectedStatus === status
                      ? "bg-primary/10 font-medium text-primary"
                      : "hover:bg-muted/50",
                  )}
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                >
                  {statusLabels[status]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              className="h-10 gap-2 rounded-xl text-xs sm:w-auto"
              onClick={handleClearAllFilters}
              variant="outline"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
