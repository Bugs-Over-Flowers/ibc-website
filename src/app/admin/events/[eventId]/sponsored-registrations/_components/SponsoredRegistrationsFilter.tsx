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
import type { Database } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";

type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

type StatusFilter = "all" | "active" | "disabled" | "full";
type SortOrder = "latest" | "oldest" | "name" | "nameDesc";

const statusLabels: Record<StatusFilter, string> = {
  all: "All Status",
  active: "Active",
  disabled: "Disabled",
  full: "Full",
};

const sortLabels: Record<SortOrder, string> = {
  latest: "Latest First",
  oldest: "Oldest First",
  name: "Name (A-Z)",
  nameDesc: "Name (Z-A)",
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
    let filtered = [...registrations];

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
      case "nameDesc":
        filtered.sort((a, b) => b.sponsoredBy.localeCompare(a.sponsoredBy));
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

  return (
    <div className="rounded-xl p-0">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-muted-foreground/70" />
          </div>
          <Input
            className="h-12 rounded-xl border-border bg-card/80 pr-12 pl-12 text-base transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-primary/20"
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

        {/* Status Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "inline-flex h-12 min-w-[160px] items-center justify-between gap-2 rounded-xl border border-border bg-card/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
              selectedStatus !== "all" && "border-primary/40 bg-primary/5",
            )}
          >
            <div className="flex items-center gap-2">
              <Filter
                className={cn(
                  "h-4 w-4",
                  selectedStatus !== "all"
                    ? "text-primary"
                    : "text-muted-foreground/70",
                )}
              />
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
      </div>
    </div>
  );
}
