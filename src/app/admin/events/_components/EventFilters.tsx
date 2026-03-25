"use client";

import { ChevronDown, Filter, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  SORT_LABELS,
  STATUS_LABELS,
} from "@/app/admin/events/_components/event-filters/constants";
import { useEventFilters } from "@/app/admin/events/_hooks/useEventFilters";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LifecycleStatus = "all" | "draft" | "published" | "finished";
type AudienceStatus = "all" | "public" | "private";

function parseStatus(value: string): {
  lifecycle: LifecycleStatus;
  audience: AudienceStatus;
} {
  switch (value) {
    case "draft":
      return { lifecycle: "draft", audience: "all" };
    case "published":
      return { lifecycle: "published", audience: "all" };
    case "published-public":
      return { lifecycle: "published", audience: "public" };
    case "published-private":
      return { lifecycle: "published", audience: "private" };
    case "finished":
      return { lifecycle: "finished", audience: "all" };
    case "finished-public":
      return { lifecycle: "finished", audience: "public" };
    case "finished-private":
      return { lifecycle: "finished", audience: "private" };
    default:
      return { lifecycle: "all", audience: "all" };
  }
}

function buildStatusValue(
  lifecycle: LifecycleStatus,
  audience: AudienceStatus,
): string | null {
  if (lifecycle === "all") {
    return null;
  }

  if (lifecycle === "draft") {
    return "draft";
  }

  if (audience === "all") {
    return lifecycle;
  }

  return `${lifecycle}-${audience}`;
}

export default function EventFilters() {
  const {
    currentSort,
    currentStatus,
    searchValue,
    hasActiveFilters,
    updateFilter,
    clearFilters,
    handleSearchChange,
  } = useEventFilters();

  const selectedSort = currentSort || "date-desc";
  const selectedStatus = currentStatus || "all";
  const { lifecycle, audience } = parseStatus(selectedStatus);

  const sortOptions = Object.entries(SORT_LABELS);
  const lifecycleOptions: Array<{ value: LifecycleStatus; label: string }> = [
    { value: "all", label: "All Status" },
    { value: "draft", label: STATUS_LABELS.draft ?? "Draft" },
    { value: "published", label: STATUS_LABELS.published ?? "Published" },
    { value: "finished", label: STATUS_LABELS.finished ?? "Finished" },
  ];
  const audienceOptions: Array<{ value: AudienceStatus; label: string }> = [
    { value: "all", label: "All Audience" },
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
  ];

  const isAudienceEnabled =
    lifecycle === "published" || lifecycle === "finished";

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
              placeholder="Search events by title..."
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
                "inline-flex h-12 min-w-[180px] items-center justify-between gap-2 rounded-xl border border-border bg-card/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                lifecycle !== "all" && "border-primary/40 bg-primary/5",
              )}
            >
              <div className="flex items-center gap-2">
                <Filter
                  className={cn(
                    "h-4 w-4",
                    lifecycle !== "all"
                      ? "text-primary"
                      : "text-muted-foreground/70",
                  )}
                />
                <span
                  className={cn(
                    "text-sm",
                    lifecycle !== "all"
                      ? "text-foreground"
                      : "text-muted-foreground/70",
                  )}
                >
                  {lifecycle === "all"
                    ? "All Status"
                    : lifecycleOptions.find(
                        (option) => option.value === lifecycle,
                      )?.label}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[220px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel>Lifecycle</DropdownMenuLabel>
                {lifecycleOptions.map((option) => (
                  <DropdownMenuItem
                    className={cn(
                      "cursor-pointer rounded-lg text-sm transition-colors",
                      lifecycle === option.value
                        ? "bg-primary/10 font-medium text-primary"
                        : "hover:bg-muted/50",
                    )}
                    key={option.value}
                    onClick={() => {
                      const nextStatus = buildStatusValue(option.value, "all");
                      updateFilter("status", nextStatus);
                    }}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex h-12 min-w-[180px] items-center justify-between gap-2 rounded-xl border border-border bg-card/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                isAudienceEnabled &&
                  audience !== "all" &&
                  "border-primary/40 bg-primary/5",
                !isAudienceEnabled && "opacity-60",
              )}
              disabled={!isAudienceEnabled}
            >
              <div className="flex items-center gap-2">
                <Filter
                  className={cn(
                    "h-4 w-4",
                    isAudienceEnabled && audience !== "all"
                      ? "text-primary"
                      : "text-muted-foreground/70",
                  )}
                />
                <span
                  className={cn(
                    "text-sm",
                    isAudienceEnabled && audience !== "all"
                      ? "text-foreground"
                      : "text-muted-foreground/70",
                  )}
                >
                  {!isAudienceEnabled
                    ? "Audience (N/A)"
                    : audienceOptions.find(
                        (option) => option.value === audience,
                      )?.label}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[220px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel>Audience</DropdownMenuLabel>
                {audienceOptions.map((option, index) => (
                  <div key={option.value}>
                    <DropdownMenuItem
                      className={cn(
                        "cursor-pointer rounded-lg text-sm transition-colors",
                        audience === option.value
                          ? "bg-primary/10 font-medium text-primary"
                          : "hover:bg-muted/50",
                      )}
                      onClick={() => {
                        const nextStatus = buildStatusValue(
                          lifecycle,
                          option.value,
                        );
                        updateFilter("status", nextStatus);
                      }}
                    >
                      {option.label}
                    </DropdownMenuItem>
                    {index === 0 ? <DropdownMenuSeparator /> : null}
                  </div>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex h-12 min-w-[180px] items-center justify-between gap-2 rounded-xl border border-border bg-card/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                selectedSort !== "date-desc" &&
                  "border-primary/40 bg-primary/5",
              )}
            >
              <span
                className={cn(
                  "text-sm",
                  selectedSort !== "date-desc"
                    ? "text-foreground"
                    : "text-muted-foreground/70",
                )}
              >
                {selectedSort === "date-desc"
                  ? "Latest First"
                  : (SORT_LABELS[selectedSort] ?? "Latest First")}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[220px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
            >
              <DropdownMenuItem
                className={cn(
                  "cursor-pointer rounded-lg text-sm transition-colors",
                  selectedSort === "date-desc"
                    ? "bg-primary/10 font-medium text-primary"
                    : "hover:bg-muted/50",
                )}
                onClick={() => updateFilter("sort", null)}
              >
                Latest First
              </DropdownMenuItem>
              {sortOptions
                .filter(([value]) => value !== "date-desc")
                .map(([value, label]) => (
                  <DropdownMenuItem
                    className={cn(
                      "cursor-pointer rounded-lg text-sm transition-colors",
                      selectedSort === value
                        ? "bg-primary/10 font-medium text-primary"
                        : "hover:bg-muted/50",
                    )}
                    key={value}
                    onClick={() => updateFilter("sort", value)}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear All Filters Button */}
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
