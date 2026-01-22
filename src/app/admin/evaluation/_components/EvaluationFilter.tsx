"use client";

import { subDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Clock,
  Filter,
  Search,
  Star,
  X,
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
import { meetsMinimumRating } from "@/lib/evaluation/ratingUtils";
import { cn } from "@/lib/utils";
import type { EvaluationWithEventRpc } from "@/server/evaluation/queries/getAllEvaluations";

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

type RatingOption = "all" | "1" | "2" | "3" | "4" | "5";

const ratingLabels: Record<RatingOption, string> = {
  all: "All Ratings",
  "1": "1+ Stars",
  "2": "2+ Stars",
  "3": "3+ Stars",
  "4": "4+ Stars",
  "5": "5 Stars",
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

const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

interface EvaluationFilterProps {
  evaluations: EvaluationWithEventRpc[];
  onFilter: (filtered: EvaluationWithEventRpc[]) => void;
}

export function EvaluationFilter({
  evaluations,
  onFilter,
}: EvaluationFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<RatingOption>("all");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [selectedDatePreset, setSelectedDatePreset] =
    useState<DatePreset>("all");

  const uniqueEvents = Array.from(
    new Set(
      evaluations
        .map((e) => e.event_title)
        .filter(
          (title): title is string => title !== null && title !== undefined,
        ),
    ),
  );

  const applyFilters = useCallback(() => {
    let filtered = evaluations;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.event_title?.toLowerCase().includes(term) ||
          e.name?.toLowerCase().includes(term),
      );
    }

    // Event filter
    if (selectedEvent) {
      filtered = filtered.filter((e) => e.event_title === selectedEvent);
    }

    // Rating filter
    if (selectedRating !== "all") {
      const minRating = parseFloat(selectedRating);
      filtered = filtered.filter((e) => {
        const ratings = [
          e.q1_rating,
          e.q2_rating,
          e.q3_rating,
          e.q4_rating,
          e.q5_rating,
          e.q6_rating,
        ];
        return meetsMinimumRating(ratings, minRating);
      });
    }

    // Date filter
    if (selectedDatePreset !== "all") {
      const dateRange = getDateRangeFromPreset(selectedDatePreset);
      if (dateRange.from) {
        const fromDate = dateRange.from;
        filtered = filtered.filter((e) => new Date(e.created_at) >= fromDate);
      }
      if (dateRange.to) {
        const endDate = new Date(dateRange.to);
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter((e) => new Date(e.created_at) <= endDate);
      }
    }

    // Sort by date
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

    onFilter(filtered);
  }, [
    searchTerm,
    selectedEvent,
    selectedRating,
    sortOrder,
    selectedDatePreset,
    evaluations,
    onFilter,
  ]);

  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setSelectedEvent("");
    setSelectedRating("all");
    setSortOrder("latest");
    setSelectedDatePreset("all");
  };

  const hasActiveFilters =
    searchTerm ||
    selectedEvent ||
    selectedRating !== "all" ||
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
            placeholder="Search evaluations by event name or respondent name..."
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
                  {truncateText(selectedEvent) || "All Events"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[220px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
            >
              <DropdownMenuItem
                className={cn(
                  "cursor-pointer rounded-lg text-sm transition-colors",
                  !selectedEvent
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
                  {truncateText(event)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Rating Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex h-10 min-w-[160px] items-center justify-between gap-2 rounded-xl border border-border/40 bg-background/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                selectedRating !== "all" && "border-primary/40 bg-primary/5",
              )}
            >
              <div className="flex items-center gap-2">
                <Star
                  className={cn(
                    "h-4 w-4",
                    selectedRating !== "all"
                      ? "text-primary"
                      : "text-muted-foreground/70",
                  )}
                />
                <span
                  className={cn(
                    "text-sm",
                    selectedRating !== "all"
                      ? "text-foreground"
                      : "text-muted-foreground/70",
                  )}
                >
                  {ratingLabels[selectedRating]}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[180px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
            >
              {(Object.keys(ratingLabels) as RatingOption[]).map((option) => (
                <DropdownMenuItem
                  className={cn(
                    "cursor-pointer rounded-lg text-sm transition-colors",
                    selectedRating === option
                      ? "bg-primary/10 font-medium text-primary"
                      : "hover:bg-muted/50",
                  )}
                  key={option}
                  onClick={() => setSelectedRating(option)}
                >
                  {ratingLabels[option]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex h-10 min-w-[160px] items-center justify-between gap-2 rounded-xl border border-border/40 bg-background/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
              )}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground/70" />
                <span className="text-muted-foreground/70 text-sm">
                  {sortOrder === "latest" ? "Latest" : "Oldest"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[180px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
            >
              <DropdownMenuItem
                className={cn(
                  "cursor-pointer rounded-lg text-sm transition-colors",
                  sortOrder === "latest"
                    ? "bg-primary/10 font-medium text-primary"
                    : "hover:bg-muted/50",
                )}
                onClick={() => setSortOrder("latest")}
              >
                Latest to Oldest
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(
                  "cursor-pointer rounded-lg text-sm transition-colors",
                  sortOrder === "oldest"
                    ? "bg-primary/10 font-medium text-primary"
                    : "hover:bg-muted/50",
                )}
                onClick={() => setSortOrder("oldest")}
              >
                Oldest to Latest
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear All Filters Button */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                animate={{ opacity: 1, scale: 1, width: "auto" }}
                exit={{ opacity: 0, scale: 0.8, width: 0 }}
                initial={{ opacity: 0, scale: 0.8, width: 0 }}
                key="clear-filters"
                transition={{ duration: 0.2 }}
              >
                <Button
                  className="h-10 whitespace-nowrap rounded-xl px-4 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleClearAllFilters}
                  variant="ghost"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear filters
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Active Filters Summary */}
      <AnimatePresence mode="wait">
        {hasActiveFilters && (
          <motion.div
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 border-border/30 border-t pt-2"
            exit={{ opacity: 0, height: 0 }}
            initial={{ opacity: 0, height: 0 }}
            key="active-filters"
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground/70 text-sm">
                Active filters:
              </span>
              {selectedDatePreset !== "all" && (
                <motion.span
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  key="date-filter"
                  transition={{ duration: 0.2 }}
                >
                  <CalendarIcon className="h-3 w-3" />
                  {datePresetLabels[selectedDatePreset]}
                  <button
                    className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                    onClick={() => setSelectedDatePreset("all")}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
              )}
              {selectedEvent && (
                <motion.span
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  key="event-filter"
                  transition={{ duration: 0.2 }}
                >
                  <Filter className="h-3 w-3" />
                  {truncateText(selectedEvent)}
                  <button
                    className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                    onClick={() => setSelectedEvent("")}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
              )}
              {selectedRating !== "all" && (
                <motion.span
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  key="rating-filter"
                  transition={{ duration: 0.2 }}
                >
                  <Filter className="h-3 w-3" />
                  {ratingLabels[selectedRating]}
                  <button
                    className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                    onClick={() => setSelectedRating("all")}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
              )}
              {sortOrder !== "latest" && (
                <motion.span
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  key="sort-filter"
                  transition={{ duration: 0.2 }}
                >
                  <Clock className="h-3 w-3" />
                  {sortOrder === "oldest"
                    ? "Oldest to Latest"
                    : "Latest to Oldest"}
                  <button
                    className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                    onClick={() => setSortOrder("latest")}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
