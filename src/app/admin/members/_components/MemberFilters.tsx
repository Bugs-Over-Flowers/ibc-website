"use client";

import { Filter, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useSearchInput } from "@/app/admin/events/_hooks/useSearchInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusLabels: Record<string, string> = {
  active: "Paid",
  unpaid: "Unpaid",
  cancelled: "Cancelled",
};

interface MemberFiltersProps {
  sectors: Array<{ sectorId: number; sectorName: string }>;
}

export default function MemberFilters({ sectors }: MemberFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "all";
  const currentSector = searchParams.get("sectorName") || "all";
  const currentSearch = searchParams.get("search") || "";

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams);

      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      router.push(`?${params.toString()}` as Route);
    },
    [searchParams, router],
  );

  const { searchValue, setSearchValue, handleSearchChange } = useSearchInput({
    initialValue: currentSearch,
    onSearch: useCallback(
      (value: string) => updateFilter("search", value),
      [updateFilter],
    ),
    debounceMs: 400,
  });

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete(key);

    if (key === "search") {
      setSearchValue("");
    }

    const qs = params.toString();
    router.push(qs ? (`?${qs}` as Route) : ("/admin/members" as Route));
  };

  const clearFilters = () => {
    setSearchValue("");
    router.push("/admin/members" as Route);
  };

  const hasActiveFilters =
    currentStatus !== "all" ||
    (currentSector && currentSector !== "all") ||
    currentSearch;

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      {/* Search + Filters Row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-muted-foreground/70" />
          </div>
          <Input
            className="h-10 rounded-xl border-border/40 bg-background/80 pr-12 pl-12 text-base transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-primary/20"
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by company name..."
            value={searchValue}
          />
          <AnimatePresence>
            {searchValue && (
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

        {/* Filters - right side */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Status Filter */}
          <Select
            onValueChange={(value) => updateFilter("status", value)}
            value={currentStatus}
          >
            <SelectTrigger className="w-full sm:w-44">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground text-xs">Status:</span>
                <SelectValue aria-label="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Membership Status</SelectLabel>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Sector Filter */}
          <Select
            onValueChange={(value) => updateFilter("sectorName", value)}
            value={currentSector}
          >
            <SelectTrigger className="w-full sm:w-44">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground text-xs">Sector:</span>
                <SelectValue aria-label="Filter by sector" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Business Sector</SelectLabel>
                <SelectItem value="all">All</SelectItem>
                {sectors.map((sector) => (
                  <SelectItem key={sector.sectorId} value={sector.sectorName}>
                    {sector.sectorName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

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
                  onClick={clearFilters}
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

      {/* Active Filters Summary - Badge pills */}
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

              {currentStatus !== "all" && (
                <motion.span
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  key="status-filter"
                  transition={{ duration: 0.2 }}
                >
                  <Filter className="h-3 w-3" />
                  Status: {statusLabels[currentStatus] || currentStatus}
                  <button
                    className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                    onClick={() => removeFilter("status")}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
              )}

              {currentSector && currentSector !== "all" && (
                <motion.span
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  key="sector-filter"
                  transition={{ duration: 0.2 }}
                >
                  <Filter className="h-3 w-3" />
                  Sector: {currentSector}
                  <button
                    className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                    onClick={() => removeFilter("sectorName")}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
              )}

              {currentSearch && (
                <motion.span
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  key="search-filter"
                  transition={{ duration: 0.2 }}
                >
                  <Search className="h-3 w-3" />
                  &ldquo;{currentSearch}&rdquo;
                  <button
                    className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                    onClick={() => removeFilter("search")}
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
