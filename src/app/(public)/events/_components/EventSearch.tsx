"use client";

import {
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  format,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subDays,
} from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Filter,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { EventStatus } from "@/lib/events/eventUtils";
import { cn } from "@/lib/utils";

export type FilterOption = "all" | "upcoming" | "past";

export interface DateRange {
  from?: Date;
  to?: Date;
}

type DatePreset =
  | "custom"
  | "thisYear"
  | "last7Days"
  | "last14Days"
  | "last30Days"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "lastQuarter";

const filterLabels: Record<FilterOption, string> = {
  all: "All Events",
  upcoming: "Upcoming",
  past: "Past Events",
};

const datePresetLabels: Record<DatePreset, string> = {
  custom: "Custom",
  thisYear: "This Year",
  last7Days: "Last 7 Days",
  last14Days: "Last 14 Days",
  last30Days: "Last 30 Days",
  thisWeek: "This Week",
  lastWeek: "Last Week",
  thisMonth: "This Month",
  lastMonth: "Last Month",
  thisQuarter: "This Quarter",
  lastQuarter: "Last Quarter",
};

const getDateRangeFromPreset = (preset: DatePreset): DateRange => {
  const today = new Date();

  switch (preset) {
    case "thisYear":
      return { from: startOfYear(today), to: today };
    case "last7Days":
      return { from: subDays(today, 7), to: today };
    case "last14Days":
      return { from: subDays(today, 14), to: today };
    case "last30Days":
      return { from: subDays(today, 30), to: today };
    case "thisWeek":
      return { from: startOfWeek(today), to: endOfWeek(today) };
    case "lastWeek": {
      const lastWeekStart = startOfWeek(subDays(today, 7));
      return { from: lastWeekStart, to: endOfWeek(lastWeekStart) };
    }
    case "thisMonth":
      return { from: startOfMonth(today), to: endOfMonth(today) };
    case "lastMonth": {
      const lastMonthStart = startOfMonth(subDays(startOfMonth(today), 1));
      return { from: lastMonthStart, to: endOfMonth(lastMonthStart) };
    }
    case "thisQuarter":
      return { from: startOfQuarter(today), to: endOfQuarter(today) };
    case "lastQuarter": {
      const lastQuarterStart = startOfQuarter(
        subDays(startOfQuarter(today), 1),
      );
      return { from: lastQuarterStart, to: endOfQuarter(lastQuarterStart) };
    }
    case "custom":
    default:
      return { from: undefined, to: undefined };
  }
};

interface EventsSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: EventStatus | "all";
  onStatusChange: (status: EventStatus | "all") => void;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
}

export function EventsSearch({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateRange = {},
  onDateRangeChange = () => {},
}: EventsSearchProps) {
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>("custom");
  const today = new Date();

  const clearDateRange = () => {
    onDateRangeChange({ from: undefined, to: undefined });
    setSelectedPreset("custom");
  };

  const handlePresetSelect = (preset: DatePreset) => {
    setSelectedPreset(preset);
    if (preset === "custom") {
      clearDateRange();
    } else {
      const newRange = getDateRangeFromPreset(preset);
      onDateRangeChange(newRange);
    }
  };

  const hasActiveFilters =
    dateRange?.from || dateRange?.to || statusFilter !== "all" || searchQuery;

  const getDateRangeLabel = () => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`;
    }
    if (dateRange?.from) {
      return `From ${format(dateRange.from, "MMM d, yyyy")}`;
    }
    if (dateRange?.to) {
      return `Until ${format(dateRange.to, "MMM d, yyyy")}`;
    }
    return "Pick a date range";
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 w-full"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Search Container with glassmorphism */}
      <div className="rounded-2xl border border-border/30 bg-card/60 p-4 shadow-xl backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-muted-foreground/70" />
            </div>
            <Input
              className="h-14 rounded-xl border-border/40 bg-background/80 pr-12 pl-12 text-base transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search events by name, description, or venue..."
              type="text"
              value={searchQuery}
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.div
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-y-0 right-2 flex items-center"
                  exit={{ opacity: 0, scale: 0.8 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    className="h-8 w-8 rounded-full hover:bg-muted/60"
                    onClick={() => onSearchChange("")}
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
            {/* Date Range Picker with Calendar */}
            <Popover onOpenChange={setIsDateRangeOpen} open={isDateRangeOpen}>
              <PopoverTrigger>
                <Button
                  className={cn(
                    "h-12 flex-1 justify-between gap-3 rounded-xl border-border/40 bg-background/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                    (dateRange?.from || dateRange?.to) &&
                      "border-primary/40 bg-primary/5",
                  )}
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <CalendarIcon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        dateRange?.from || dateRange?.to
                          ? "text-primary"
                          : "text-muted-foreground/70",
                      )}
                    />
                    <span
                      className={cn(
                        "truncate",
                        !(dateRange?.from || dateRange?.to) &&
                          "text-muted-foreground/70",
                      )}
                    >
                      {getDateRangeLabel()}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground/70 transition-transform",
                      isDateRangeOpen && "rotate-180",
                    )}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-auto rounded-xl border-border/50 bg-card p-0 shadow-2xl"
                sideOffset={8}
              >
                <div className="flex">
                  {/* Dual Calendar */}
                  <div className="flex border-border/30 border-r">
                    <Calendar
                      className="pointer-events-auto p-3"
                      initialFocus
                      mode="single"
                      onSelect={(date) => {
                        onDateRangeChange({ ...dateRange, from: date });
                        setSelectedPreset("custom");
                      }}
                      selected={dateRange?.from}
                    />
                    <Calendar
                      className="pointer-events-auto border-border/30 border-l p-3"
                      disabled={(date) =>
                        dateRange?.from ? date < dateRange.from : false
                      }
                      mode="single"
                      onSelect={(date) => {
                        onDateRangeChange({ ...dateRange, to: date });
                        setSelectedPreset("custom");
                      }}
                      selected={dateRange?.to}
                    />
                  </div>

                  {/* Date Range Presets */}
                  <div className="w-40 border-border/30 border-l p-2">
                    <div className="mb-1 px-2 py-1.5 font-medium text-muted-foreground text-xs">
                      Quick Select
                    </div>
                    {(Object.keys(datePresetLabels) as DatePreset[])
                      .filter((preset) => preset !== "custom")
                      .map((preset) => (
                        <button
                          className={cn(
                            "w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                            selectedPreset === preset
                              ? "bg-primary/10 font-medium text-primary"
                              : "text-foreground hover:bg-muted/50",
                          )}
                          key={preset}
                          onClick={() => {
                            handlePresetSelect(preset);
                            setIsDateRangeOpen(false);
                          }}
                          type="button"
                        >
                          {datePresetLabels[preset]}
                        </button>
                      ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  className={cn(
                    "h-12 min-w-[160px] justify-between gap-2 rounded-xl border-border/40 bg-background/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                    statusFilter !== "all" && "border-primary/40 bg-primary/5",
                  )}
                  variant="outline"
                >
                  <div className="flex items-center gap-2">
                    <Filter
                      className={cn(
                        "h-4 w-4",
                        statusFilter !== "all"
                          ? "text-primary"
                          : "text-muted-foreground/70",
                      )}
                    />
                    <span
                      className={
                        statusFilter !== "all"
                          ? "text-foreground"
                          : "text-muted-foreground/70"
                      }
                    >
                      {filterLabels[statusFilter as FilterOption]}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[180px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
              >
                {(Object.keys(filterLabels) as FilterOption[]).map((option) => (
                  <DropdownMenuItem
                    className={cn(
                      "cursor-pointer rounded-lg transition-colors",
                      statusFilter === option
                        ? "bg-primary/10 font-medium text-primary"
                        : "hover:bg-muted/50",
                    )}
                    key={option}
                    onClick={() =>
                      onStatusChange(option as EventStatus | "all")
                    }
                  >
                    {filterLabels[option]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear All Filters Button */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.div
                  animate={{ opacity: 1, scale: 1, width: "auto" }}
                  exit={{ opacity: 0, scale: 0.8, width: 0 }}
                  initial={{ opacity: 0, scale: 0.8, width: 0 }}
                >
                  <Button
                    className="h-12 whitespace-nowrap rounded-xl px-4 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      clearDateRange();
                      onStatusChange("all");
                      onSearchChange("");
                    }}
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
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 border-border/30 border-t pt-4"
              exit={{ opacity: 0, height: 0 }}
              initial={{ opacity: 0, height: 0 }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground/70 text-sm">
                  Active filters:
                </span>
                {(dateRange?.from || dateRange?.to) && (
                  <motion.span
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                  >
                    <CalendarIcon className="h-3 w-3" />
                    {selectedPreset !== "custom"
                      ? datePresetLabels[selectedPreset]
                      : getDateRangeLabel()}
                    <button
                      className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                      onClick={clearDateRange}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                )}
                {statusFilter !== "all" && (
                  <motion.span
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                  >
                    <Filter className="h-3 w-3" />
                    {filterLabels[statusFilter as FilterOption]}
                    <button
                      className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                      onClick={() => onStatusChange("all")}
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
    </motion.div>
  );
}
