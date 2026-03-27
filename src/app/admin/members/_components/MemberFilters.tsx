"use client";

import {
  CheckCircle2,
  ChevronDown,
  Filter,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useSearchInput } from "@/app/admin/events/_hooks/useSearchInput";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type StatusOption = "all" | "active" | "unpaid" | "cancelled";

const statusLabels: Record<StatusOption, string> = {
  all: "All Status",
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

  const currentStatus = (searchParams.get("status") || "all") as StatusOption;
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

  const statusOptions: StatusOption[] = [
    "all",
    "active",
    "unpaid",
    "cancelled",
  ];

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
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by company name or member ID..."
              type="text"
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
        </div>

        {/* Filters Row */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Status Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex h-12 min-w-[160px] items-center justify-between gap-2 rounded-xl border border-border bg-card/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                currentStatus !== "all" && "border-primary/40 bg-primary/5",
              )}
            >
              <div className="flex items-center gap-2">
                {currentStatus === "active" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : currentStatus === "cancelled" ? (
                  <XCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <Filter
                    className={cn(
                      "h-4 w-4",
                      currentStatus !== "all"
                        ? "text-primary"
                        : "text-muted-foreground/70",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "text-sm",
                    currentStatus !== "all"
                      ? "text-foreground"
                      : "text-muted-foreground/70",
                  )}
                >
                  {statusLabels[currentStatus]}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[180px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
            >
              {statusOptions.map((status) => (
                <DropdownMenuItem
                  className={cn(
                    "cursor-pointer rounded-lg text-sm transition-colors",
                    currentStatus === status
                      ? "bg-primary/10 font-medium text-primary"
                      : "hover:bg-muted/50",
                  )}
                  key={status}
                  onClick={() => updateFilter("status", status)}
                >
                  {statusLabels[status]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sector Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex h-12 min-w-[160px] items-center justify-between gap-2 rounded-xl border border-border bg-card/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                currentSector !== "all" && "border-primary/40 bg-primary/5",
              )}
            >
              <div className="flex items-center gap-2">
                <Filter
                  className={cn(
                    "h-4 w-4",
                    currentSector !== "all"
                      ? "text-primary"
                      : "text-muted-foreground/70",
                  )}
                />
                <span
                  className={cn(
                    "truncate text-sm",
                    currentSector !== "all"
                      ? "text-foreground"
                      : "text-muted-foreground/70",
                  )}
                  title={
                    currentSector === "all" ? "All Sectors" : currentSector
                  }
                >
                  {currentSector === "all" ? "All Sectors" : currentSector}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[220px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
            >
              <DropdownMenuItem
                className={cn(
                  "cursor-pointer rounded-lg text-sm transition-colors",
                  currentSector === "all"
                    ? "bg-primary/10 font-medium text-primary"
                    : "hover:bg-muted/50",
                )}
                onClick={() => updateFilter("sectorName", "all")}
              >
                All Sectors
              </DropdownMenuItem>
              {sectors.map((sector) => (
                <DropdownMenuItem
                  className={cn(
                    "cursor-pointer rounded-lg text-sm transition-colors",
                    currentSector === sector.sectorName
                      ? "bg-primary/10 font-medium text-primary"
                      : "hover:bg-muted/50",
                  )}
                  key={sector.sectorId}
                  onClick={() => updateFilter("sectorName", sector.sectorName)}
                  title={sector.sectorName}
                >
                  <span className="block truncate">{sector.sectorName}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              className="h-12 gap-2 rounded-xl text-xs sm:w-auto"
              onClick={clearFilters}
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
