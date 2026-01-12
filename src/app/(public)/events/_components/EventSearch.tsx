"use client";

import {
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subQuarters,
} from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Filter,
  Search,
  X,
} from "lucide-react";
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

type StatusOption = {
  value: EventStatus | "all";
  label: string;
};

type DateRange = {
  from?: Date;
  to?: Date;
};

type DateRangePreset = {
  label: string;
  value: string;
  getRange: () => DateRange;
};

const statusFilters: StatusOption[] = [
  { value: "all", label: "All Events" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past Events" },
];

const dateRangePresets: DateRangePreset[] = [
  {
    label: "This Year",
    value: "this-year",
    getRange: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    }),
  },
  {
    label: "Last 7 Days",
    value: "last-7-days",
    getRange: () => ({ from: subDays(new Date(), 7), to: new Date() }),
  },
  {
    label: "Last 14 Days",
    value: "last-14-days",
    getRange: () => ({ from: subDays(new Date(), 14), to: new Date() }),
  },
  {
    label: "Last 30 Days",
    value: "last-30-days",
    getRange: () => ({ from: subDays(new Date(), 30), to: new Date() }),
  },
  {
    label: "This Week",
    value: "this-week",
    getRange: () => ({
      from: startOfWeek(new Date()),
      to: endOfWeek(new Date()),
    }),
  },
  {
    label: "Last Week",
    value: "last-week",
    getRange: () => ({
      from: startOfWeek(subDays(new Date(), 7)),
      to: endOfWeek(subDays(new Date(), 7)),
    }),
  },
  {
    label: "This Month",
    value: "this-month",
    getRange: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: "Last Month",
    value: "last-month",
    getRange: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    label: "This Quarter",
    value: "this-quarter",
    getRange: () => ({
      from: startOfQuarter(new Date()),
      to: endOfQuarter(new Date()),
    }),
  },
  {
    label: "Last Quarter",
    value: "last-quarter",
    getRange: () => ({
      from: startOfQuarter(subQuarters(new Date(), 1)),
      to: endOfQuarter(subQuarters(new Date(), 1)),
    }),
  },
];

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
  const [isFromDateOpen, setIsFromDateOpen] = useState(false);
  const [isToDateOpen, setIsToDateOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const today = new Date();

  const handlePresetSelect = (preset: DateRangePreset | null) => {
    if (!preset) {
      // Custom option
      setIsCustom(true);
      setSelectedPreset("custom");
      return;
    }
    setIsCustom(false);
    setSelectedPreset(preset.value);
    onDateRangeChange(preset.getRange());
  };

  const handleFromDateSelect = (date: Date | undefined) => {
    onDateRangeChange({ from: date, to: dateRange.to });
    setIsFromDateOpen(false);
  };

  const handleToDateSelect = (date: Date | undefined) => {
    onDateRangeChange({ from: dateRange.from, to: date });
    setIsToDateOpen(false);
  };

  const handleClearFromDate = () => {
    onDateRangeChange({ from: undefined, to: dateRange.to });
  };

  const handleClearToDate = () => {
    onDateRangeChange({ from: dateRange.from, to: undefined });
  };

  const clearDateRange = () => {
    onDateRangeChange({ from: undefined, to: undefined });
    setSelectedPreset(null);
    setIsCustom(false);
  };

  const clearAllFilters = () => {
    clearDateRange();
    onStatusChange("all");
    onSearchChange("");
  };

  const hasActiveFilters =
    dateRange.from || dateRange.to || statusFilter !== "all" || searchQuery;

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
          {/* Search Input - Full Width */}
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
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted/60"
                    onClick={() => onSearchChange("")}
                    type="button"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Date Range Preset Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  className={cn(
                    "h-12 min-w-[180px] justify-between gap-2 rounded-xl border-border/40 bg-background/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                    selectedPreset && "border-primary/40 bg-primary/5",
                  )}
                  variant="outline"
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon
                      className={cn(
                        "h-4 w-4",
                        selectedPreset
                          ? "text-primary"
                          : "text-muted-foreground/70",
                      )}
                    />
                    <span
                      className={cn(
                        "truncate",
                        selectedPreset
                          ? "text-foreground"
                          : "text-muted-foreground/70",
                      )}
                    >
                      {selectedPreset
                        ? dateRangePresets.find(
                            (p) => p.value === selectedPreset,
                          )?.label || "Custom"
                        : "Date Range"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[180px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
              >
                {dateRangePresets.map((preset) => (
                  <DropdownMenuItem
                    className={cn(
                      "cursor-pointer rounded-lg transition-colors",
                      selectedPreset === preset.value
                        ? "bg-primary/10 font-medium text-primary"
                        : "hover:bg-muted/50",
                    )}
                    key={preset.value}
                    onClick={() => handlePresetSelect(preset)}
                  >
                    {preset.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  className={cn(
                    "cursor-pointer rounded-lg transition-colors",
                    selectedPreset === "custom"
                      ? "bg-primary/10 font-medium text-primary"
                      : "hover:bg-muted/50",
                  )}
                  onClick={() => handlePresetSelect(null)}
                >
                  Custom
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* From Date Button - Only show when Custom is selected */}
            {isCustom && (
              <Popover onOpenChange={setIsFromDateOpen} open={isFromDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    className={cn(
                      "h-12 flex-1 justify-start gap-3 rounded-xl border-border/40 bg-background/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                      dateRange.from && "border-primary/40 bg-primary/5",
                    )}
                    variant="outline"
                  >
                    <CalendarIcon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        dateRange.from
                          ? "text-primary"
                          : "text-muted-foreground/70",
                      )}
                    />
                    <span
                      className={cn(
                        "truncate",
                        !dateRange.from && "text-muted-foreground/70",
                      )}
                    >
                      {dateRange.from
                        ? format(dateRange.from, "MMM d, yyyy")
                        : "From"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-auto rounded-xl border-border/50 bg-card p-0 shadow-2xl"
                >
                  <Calendar
                    className="pointer-events-auto"
                    disabled={(date) => date > today}
                    initialFocus
                    mode="single"
                    onSelect={handleFromDateSelect}
                    selected={dateRange.from}
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* To Date Button - Only show when Custom is selected */}
            {isCustom && (
              <Popover onOpenChange={setIsToDateOpen} open={isToDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    className={cn(
                      "h-12 flex-1 justify-start gap-3 rounded-xl border-border/40 bg-background/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                      dateRange.to && "border-primary/40 bg-primary/5",
                    )}
                    variant="outline"
                  >
                    <CalendarIcon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        dateRange.to
                          ? "text-primary"
                          : "text-muted-foreground/70",
                      )}
                    />
                    <span
                      className={cn(
                        "truncate",
                        !dateRange.to && "text-muted-foreground/70",
                      )}
                    >
                      {dateRange.to
                        ? format(dateRange.to, "MMM d, yyyy")
                        : "To"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-auto rounded-xl border-border/50 bg-card p-0 shadow-2xl"
                >
                  <Calendar
                    className="pointer-events-auto"
                    disabled={(date) =>
                      date > today ||
                      (dateRange.from ? date < dateRange.from : false)
                    }
                    initialFocus
                    mode="single"
                    onSelect={handleToDateSelect}
                    selected={dateRange.to}
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Status Filter */}
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
                      className={cn(
                        statusFilter !== "all"
                          ? "text-foreground"
                          : "text-muted-foreground/70",
                      )}
                    >
                      {statusFilters.find((s) => s.value === statusFilter)
                        ?.label ?? "All Events"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[180px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
              >
                {statusFilters.map((option) => (
                  <DropdownMenuItem
                    className={cn(
                      "cursor-pointer rounded-lg transition-colors",
                      statusFilter === option.value
                        ? "bg-primary/10 font-medium text-primary"
                        : "hover:bg-muted/50",
                    )}
                    key={option.value}
                    onClick={() => onStatusChange(option.value)}
                  >
                    {option.label}
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
                    onClick={clearAllFilters}
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
                {searchQuery && (
                  <motion.span
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                  >
                    <Search className="h-3 w-3" />
                    Search: {searchQuery}
                    <button
                      className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                      onClick={() => onSearchChange("")}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                )}
                {selectedPreset && (
                  <motion.span
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                  >
                    <CalendarIcon className="h-3 w-3" />
                    {dateRangePresets.find((p) => p.value === selectedPreset)
                      ?.label || "Custom Range"}
                    <button
                      className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                      onClick={clearDateRange}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                )}
                {dateRange.from && !selectedPreset && (
                  <motion.span
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                  >
                    <CalendarIcon className="h-3 w-3" />
                    From: {format(dateRange.from, "MMM d")}
                    <button
                      className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                      onClick={handleClearFromDate}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                )}
                {dateRange.to && !selectedPreset && (
                  <motion.span
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                  >
                    <CalendarIcon className="h-3 w-3" />
                    To: {format(dateRange.to, "MMM d")}
                    <button
                      className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                      onClick={handleClearToDate}
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
                    {statusFilters.find((s) => s.value === statusFilter)?.label}
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
