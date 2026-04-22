"use client";

import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar as CalendarIcon, Filter, X } from "lucide-react";
import type { EventStatus } from "@/lib/events/eventUtils";
import {
  type DatePreset,
  type DateRange,
  datePresetLabels,
  type FilterOption,
  filterLabels,
} from "../../_utils/searchUtils";

interface EventSearchActiveFiltersProps {
  dateRange: DateRange;
  selectedPreset: DatePreset;
  statusFilter: EventStatus | "all";
  clearDateRange: () => void;
  onStatusChange: (status: EventStatus | "all") => void;
}

function getDateRangeLabel(dateRange: DateRange) {
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
}

export default function EventSearchActiveFilters({
  dateRange,
  selectedPreset,
  statusFilter,
  clearDateRange,
  onStatusChange,
}: EventSearchActiveFiltersProps) {
  const hasActiveFilters =
    dateRange?.from || dateRange?.to || statusFilter !== "all";

  return (
    <AnimatePresence mode="wait">
      {hasActiveFilters && (
        <motion.div
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 border-border/30 border-t pt-4"
          exit={{ opacity: 0, height: 0 }}
          initial={{ opacity: 0, height: 0 }}
          key="active-filters"
          transition={{ duration: 0.2 }}
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
                key="date-filter"
                transition={{ duration: 0.2 }}
              >
                <CalendarIcon className="h-3 w-3" />
                {selectedPreset !== "custom"
                  ? datePresetLabels[selectedPreset]
                  : getDateRangeLabel(dateRange)}
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
                key="status-filter"
                transition={{ duration: 0.2 }}
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
  );
}
