/**
 * ApplicationHistoryFilters — Client-side search, filter, and date range controls
 * for the application history page.
 *
 * Provides three filtering mechanisms:
 * 1. **Text search** — matches against identifier, company address (location),
 *    email, phone number, application date, and representative names
 *    (principal + alternate).
 * 2. **Application type filter** — dropdown to filter by newMember, renewal, or updating.
 * 3. **Date range picker** — Popover with dual calendars + quick-select presets to
 *    filter applications by applicationDate (inclusive on both ends).
 *
 * All filtering is done client-side on the already-fetched data.
 * Filter state is managed locally via useState and communicated to the parent
 * through the `onFiltersChange` callback.
 */
"use client";

import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Filter,
  Search,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import type { Enums } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";
import type { ApplicationHistoryItem } from "@/server/applications/queries/getApplicationHistory";

/** Available application type filter options. "all" shows everything. */
type ApplicationTypeFilter = "all" | Enums<"ApplicationType">;

/** Date range for filtering — both bounds are optional. */
interface DateRange {
  from?: Date;
  to?: Date;
}

/** Human-readable labels for each application type filter option. */
const APPLICATION_TYPE_LABELS: Record<ApplicationTypeFilter, string> = {
  all: "All Types",
  newMember: "New Member",
  renewal: "Renewal",
  updating: "Update Info",
};

interface ApplicationHistoryFiltersProps {
  applications: ApplicationHistoryItem[];
  onFiltersChange: (filtered: ApplicationHistoryItem[]) => void;
}

export function ApplicationHistoryFilters({
  applications,
  onFiltersChange,
}: ApplicationHistoryFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ApplicationTypeFilter>("all");
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  /** Debounce search input to avoid excessive re-filtering on every keystroke. */
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  /**
   * Memoized filter logic — applies all three filters (search, type, date range)
   * to the applications list. Runs whenever any filter state or the source data changes.
   */
  const filteredApplications = useMemo(() => {
    let result = applications;

    // 1. Text search — case-insensitive match across multiple fields
    if (debouncedSearch.trim()) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter((app) => {
        const principalMember = app.members.find(
          (m) => m.companyMemberType === "principal",
        );
        const alternateMember = app.members.find(
          (m) => m.companyMemberType === "alternate",
        );
        const principalName = principalMember
          ? `${principalMember.firstName} ${principalMember.lastName}`.toLowerCase()
          : "";
        const alternateName = alternateMember
          ? `${alternateMember.firstName} ${alternateMember.lastName}`.toLowerCase()
          : "";

        const formattedDate = new Date(app.applicationDate).toLocaleDateString(
          "en-US",
          { year: "numeric", month: "long", day: "numeric" },
        );

        return (
          app.identifier.toLowerCase().includes(term) ||
          app.companyAddress.toLowerCase().includes(term) ||
          app.emailAddress.toLowerCase().includes(term) ||
          app.mobileNumber.toLowerCase().includes(term) ||
          formattedDate.toLowerCase().includes(term) ||
          principalName.includes(term) ||
          alternateName.includes(term)
        );
      });
    }

    // 2. Application type filter
    if (typeFilter !== "all") {
      result = result.filter((app) => app.applicationType === typeFilter);
    }

    // 3. Date range filter (inclusive on both ends)
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      result = result.filter(
        (app) => new Date(app.applicationDate) >= fromDate,
      );
    }
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter((app) => new Date(app.applicationDate) <= toDate);
    }

    return result;
  }, [applications, debouncedSearch, typeFilter, dateRange]);

  // Notify parent whenever filtered results change
  useEffect(() => {
    onFiltersChange(filteredApplications);
  }, [filteredApplications, onFiltersChange]);

  const clearDateRange = () => {
    setDateRange({});
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setTypeFilter("all");
    setDateRange({});
  };

  const hasActiveFilters =
    searchTerm || typeFilter !== "all" || dateRange.from || dateRange.to;

  /** Format the date range trigger label for display. */
  const getDateRangeLabel = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`;
    }
    if (dateRange.from) {
      return `From ${format(dateRange.from, "MMM d, yyyy")}`;
    }
    if (dateRange.to) {
      return `Until ${format(dateRange.to, "MMM d, yyyy")}`;
    }
    return "Date Range";
  };

  return (
    <div className="rounded-xl p-0">
      <div className="flex flex-col gap-3">
        {/* Search bar */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-muted-foreground/70" />
          </div>
          <Input
            autoComplete="off"
            className="h-12 rounded-xl border-border bg-card/80 pr-12 pl-12 text-base transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-primary/20"
            data-form-type="other"
            data-lpignore="true"
            name="history-search"
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by identifier, location, email, phone, date, principal, or alternate..."
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
                  onClick={() => handleSearchChange("")}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filters row: Application Type + Date Range + Clear */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Application type filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex h-10 min-w-[160px] items-center justify-between gap-2 rounded-xl border border-border bg-card/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                typeFilter !== "all" && "border-primary/40 bg-primary/5",
              )}
            >
              <div className="flex items-center gap-2">
                <Filter
                  className={cn(
                    "h-4 w-4",
                    typeFilter !== "all"
                      ? "text-primary"
                      : "text-muted-foreground/70",
                  )}
                />
                <span
                  className={cn(
                    "text-sm",
                    typeFilter !== "all"
                      ? "text-foreground"
                      : "text-muted-foreground/70",
                  )}
                >
                  {APPLICATION_TYPE_LABELS[typeFilter]}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[180px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
            >
              {(
                Object.keys(APPLICATION_TYPE_LABELS) as ApplicationTypeFilter[]
              ).map((type) => (
                <DropdownMenuItem
                  className={cn(
                    "cursor-pointer rounded-lg text-sm transition-colors",
                    typeFilter === type
                      ? "bg-primary/10 font-medium text-primary"
                      : "hover:bg-muted/50",
                  )}
                  key={type}
                  onClick={() => setTypeFilter(type)}
                >
                  {APPLICATION_TYPE_LABELS[type]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date range picker with dual calendars in a popover */}
          <Popover onOpenChange={setIsDateRangeOpen} open={isDateRangeOpen}>
            <PopoverTrigger
              className={cn(
                "inline-flex h-10 min-w-[180px] cursor-pointer items-center justify-between gap-2 rounded-xl border border-border bg-card/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                (dateRange.from || dateRange.to) &&
                  "border-primary/40 bg-primary/5",
              )}
              nativeButton={false}
              render={<div />}
            >
              <div className="flex items-center gap-2">
                <CalendarIcon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    dateRange.from || dateRange.to
                      ? "text-primary"
                      : "text-muted-foreground/70",
                  )}
                />
                <span
                  className={cn(
                    "truncate text-sm",
                    !(dateRange.from || dateRange.to) &&
                      "text-muted-foreground/70",
                  )}
                >
                  {getDateRangeLabel()}
                </span>
              </div>
              {/* Show X to clear date range, otherwise show chevron */}
              {dateRange.from || dateRange.to ? (
                <button
                  className="rounded-full p-0.5 hover:bg-muted/60"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearDateRange();
                  }}
                  type="button"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ) : (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground/70 transition-transform",
                    isDateRangeOpen && "rotate-180",
                  )}
                />
              )}
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-auto rounded-xl border-border/50 bg-card p-0 shadow-2xl"
              collisionPadding={16}
              sideOffset={8}
            >
              {/* Dual calendar: "From" on the left, "To" on the right */}
              <div className="flex flex-col sm:flex-row">
                <div className="flex flex-col items-center border-border/30 p-3 sm:border-r">
                  <span className="mb-1 font-medium text-muted-foreground text-xs">
                    From
                  </span>
                  <Calendar
                    className="pointer-events-auto"
                    mode="single"
                    onSelect={(date) =>
                      setDateRange((prev) => ({ ...prev, from: date }))
                    }
                    selected={dateRange.from}
                  />
                </div>
                <div className="flex flex-col items-center border-border/30 border-t p-3 sm:border-t-0">
                  <span className="mb-1 font-medium text-muted-foreground text-xs">
                    To
                  </span>
                  <Calendar
                    className="pointer-events-auto"
                    disabled={(date) =>
                      dateRange.from ? date < dateRange.from : false
                    }
                    mode="single"
                    onSelect={(date) =>
                      setDateRange((prev) => ({ ...prev, to: date }))
                    }
                    selected={dateRange.to}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Clear all filters button */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                initial={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  className="h-10 gap-2 rounded-xl text-xs"
                  onClick={clearAllFilters}
                  variant="destructive"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
