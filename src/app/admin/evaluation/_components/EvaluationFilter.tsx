"use client";

import { ChevronDown, Filter, Search, X } from "lucide-react";
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

type RatingOption = "all" | "1" | "2" | "3" | "4" | "5";
type SortOrder = "latest" | "oldest";

const ratingLabels: Record<RatingOption, string> = {
  all: "All Ratings",
  "1": "1+ Stars",
  "2": "2+ Stars",
  "3": "3+ Stars",
  "4": "4+ Stars",
  "5": "5 Stars",
};

const sortLabels: Record<SortOrder, string> = {
  latest: "Latest First",
  oldest: "Oldest First",
};

interface EvaluationFilterProps {
  evaluations: EvaluationWithEventRpc[];
  onFilter: (filtered: EvaluationWithEventRpc[]) => void;
  hideEventFilter?: boolean;
  searchPlaceholder?: string;
}

export function EvaluationFilter({
  evaluations,
  onFilter,
  hideEventFilter = false,
  searchPlaceholder = "Search evaluations by respondent name...",
}: EvaluationFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<RatingOption>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest");

  const uniqueEvents = Array.from(
    new Set(
      evaluations
        .map((e) => e.event_title)
        .filter(
          (title): title is string => title !== null && title !== undefined,
        ),
    ),
  ).sort();

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
    if (selectedEvent && !hideEventFilter) {
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
    evaluations,
    hideEventFilter,
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
  };

  const hasActiveFilters =
    searchTerm ||
    selectedEvent ||
    selectedRating !== "all" ||
    sortOrder !== "latest";

  return (
    <div className="rounded-xl p-0">
      <div className="flex flex-col gap-3">
        {/* Search Bar */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-muted-foreground/70" />
            </div>
            <Input
              className="h-12 rounded-xl border-border bg-card/80 pr-12 pl-12 text-base transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-primary/20"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
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
        </div>

        {/* Filters Row */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Event Filter Dropdown */}
          {!hideEventFilter && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "inline-flex h-12 min-w-[160px] items-center justify-between gap-2 rounded-xl border border-border bg-card/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                  selectedEvent && "border-primary/40 bg-primary/5",
                )}
              >
                <div className="flex items-center gap-2">
                  <Filter
                    className={cn(
                      "h-4 w-4",
                      selectedEvent
                        ? "text-primary"
                        : "text-muted-foreground/70",
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
          )}

          {/* Rating Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex h-12 min-w-[160px] items-center justify-between gap-2 rounded-xl border border-border bg-card/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                selectedRating !== "all" && "border-primary/40 bg-primary/5",
              )}
            >
              <div className="flex items-center gap-2">
                <Filter
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
                "inline-flex h-12 min-w-[160px] items-center justify-between gap-2 rounded-xl border border-border bg-card/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                sortOrder !== "latest" && "border-primary/40 bg-primary/5",
              )}
            >
              <span
                className={cn(
                  "text-sm",
                  sortOrder !== "latest"
                    ? "text-foreground"
                    : "text-muted-foreground/70",
                )}
              >
                {sortLabels[sortOrder]}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[180px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
            >
              {(Object.keys(sortLabels) as SortOrder[]).map((order) => (
                <DropdownMenuItem
                  className={cn(
                    "cursor-pointer rounded-lg text-sm transition-colors",
                    sortOrder === order
                      ? "bg-primary/10 font-medium text-primary"
                      : "hover:bg-muted/50",
                  )}
                  key={order}
                  onClick={() => setSortOrder(order)}
                >
                  {sortLabels[order]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              className="h-12 gap-2 rounded-xl text-xs sm:w-auto"
              onClick={handleClearAllFilters}
              variant="destructive"
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
