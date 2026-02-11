"use client";

import { ChevronDown, Search, X } from "lucide-react";
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
import type { Database } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";

type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

type StatusFilter = "all" | "active" | "inactive" | "full";
type SortOrder = "latest" | "oldest" | "name";

const statusLabels: Record<StatusFilter, string> = {
  all: "All Status",
  active: "Active",
  inactive: "Inactive",
  full: "Full",
};

const sortLabels: Record<SortOrder, string> = {
  latest: "Latest First",
  oldest: "Oldest First",
  name: "Name (A-Z)",
};

interface SponsoredRegistrationsFilterProps {
  registrations: SponsoredRegistration[];
  onFilter: (filtered: SponsoredRegistration[]) => void;
}

export function SponsoredRegistrationsFilter({
  registrations,
  onFilter,
}: SponsoredRegistrationsFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest");

  const applyFilters = useCallback(() => {
    let filtered = registrations;

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((r) =>
        r.sponsoredBy.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((r) => r.status === selectedStatus);
    }

    // Sort
    switch (sortOrder) {
      case "name":
        filtered.sort((a, b) => a.sponsoredBy.localeCompare(b.sponsoredBy));
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }

    onFilter(filtered);
  }, [registrations, searchTerm, selectedStatus, sortOrder, onFilter]);

  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedStatus !== "all" ||
    sortOrder !== "latest";

  const handleReset = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSortOrder("latest");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex flex-col gap-3">
        {/* Search Bar and Filters Row */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-muted-foreground/70" />
            </div>
            <Input
              className="h-10 rounded-xl border-border/40 bg-background/80 pr-12 pl-12 text-base transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-primary/20"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by sponsor name..."
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
            {/* Status Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "inline-flex h-10 min-w-[160px] items-center justify-between gap-2 rounded-xl border border-border/40 bg-background/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                  selectedStatus !== "all" && "border-primary/40 bg-primary/5",
                )}
              >
                <span className="text-sm">{statusLabels[selectedStatus]}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[180px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
              >
                {(Object.keys(statusLabels) as StatusFilter[]).map((status) => (
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

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "inline-flex h-10 min-w-[160px] items-center justify-between gap-2 rounded-xl border border-border/40 bg-background/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                  sortOrder !== "latest" && "border-primary/40 bg-primary/5",
                )}
              >
                <span className="text-sm">{sortLabels[sortOrder]}</span>
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
                    className="rounded-xl"
                    onClick={handleReset}
                    size="sm"
                    variant="outline"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Clear All
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
              className="border-border/30 border-t pt-2"
              exit={{ opacity: 0, height: 0 }}
              initial={{ opacity: 0, height: 0 }}
              key="active-filters"
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground/70 text-sm">
                  Active filters:
                </span>
                {selectedStatus !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-primary text-sm">
                    {statusLabels[selectedStatus]}
                  </span>
                )}
                {sortOrder !== "latest" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-primary text-sm">
                    {sortLabels[sortOrder]}
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-primary text-sm">
                    Search: "{searchTerm}"
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
