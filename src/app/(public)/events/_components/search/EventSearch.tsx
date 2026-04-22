"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { EventStatus } from "@/lib/events/eventUtils";
import {
  type DateRange,
  getDateRangeFromPreset,
} from "../../_utils/searchUtils";
import EventSearchActiveFilters from "./EventSearchActiveFilters";
import EventSearchDateFilter from "./EventSearchDateFilter";
import EventSearchInput from "./EventSearchInput";
import EventSearchStatusFilter from "./EventSearchStatusFilter";

export type { DateRange, FilterOption } from "../../_utils/searchUtils";

import type { DatePreset } from "../../_utils/searchUtils";

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
          <EventSearchInput
            onSearchChange={onSearchChange}
            searchQuery={searchQuery}
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <EventSearchDateFilter
              dateRange={dateRange}
              isOpen={isDateRangeOpen}
              onDateRangeChange={(range) => {
                onDateRangeChange(range);
                setSelectedPreset("custom");
              }}
              onOpenChange={setIsDateRangeOpen}
              onPresetSelect={handlePresetSelect}
              selectedPreset={selectedPreset}
              today={today}
            />

            <EventSearchStatusFilter
              onStatusChange={onStatusChange}
              statusFilter={statusFilter}
            />

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

        <EventSearchActiveFilters
          clearDateRange={clearDateRange}
          dateRange={dateRange}
          onStatusChange={onStatusChange}
          selectedPreset={selectedPreset}
          statusFilter={statusFilter}
        />
      </div>
    </motion.div>
  );
}
