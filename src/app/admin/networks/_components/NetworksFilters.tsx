import { ChevronDown, Filter, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SortOption } from "./networkForm";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest First",
  oldest: "Oldest First",
  "organization-asc": "Organization A-Z",
  "organization-desc": "Organization Z-A",
};

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "newest", label: SORT_LABELS.newest },
  { value: "oldest", label: SORT_LABELS.oldest },
  { value: "organization-asc", label: SORT_LABELS["organization-asc"] },
  { value: "organization-desc", label: SORT_LABELS["organization-desc"] },
];

interface NetworksFiltersProps {
  searchQuery: string;
  sortBy: SortOption;
  onSearchQueryChange: (value: string) => void;
  onSortByChange: (value: SortOption) => void;
}

export function NetworksFilters({
  searchQuery,
  sortBy,
  onSearchQueryChange,
  onSortByChange,
}: NetworksFiltersProps) {
  const sortLabel = SORT_LABELS[sortBy];

  return (
    <div className="rounded-xl p-0">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-muted-foreground/70" />
            </div>
            <Input
              className="h-12 rounded-xl border-border bg-card/80 pr-12 pl-12 text-base transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-primary/20"
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search by organization"
              value={searchQuery}
            />

            <AnimatePresence>
              {searchQuery ? (
                <motion.div
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-y-0 right-2 flex items-center"
                  exit={{ opacity: 0, scale: 0.8 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    className="h-8 w-8 rounded-full hover:bg-muted/60"
                    onClick={() => onSearchQueryChange("")}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex h-12 min-w-[180px] items-center justify-between gap-2 rounded-xl border border-border bg-card/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
                sortBy !== "newest" && "border-primary/40 bg-primary/5",
              )}
            >
              <div className="flex items-center gap-2">
                <Filter
                  className={cn(
                    "h-4 w-4",
                    sortBy !== "newest"
                      ? "text-primary"
                      : "text-muted-foreground/70",
                  )}
                />
                <span
                  className={cn(
                    "text-sm",
                    sortBy !== "newest"
                      ? "text-foreground"
                      : "text-muted-foreground/70",
                  )}
                >
                  {sortLabel}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[220px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs uppercase tracking-wide">
                  Sort
                </DropdownMenuLabel>
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    className={cn(
                      "cursor-pointer rounded-lg text-sm transition-colors",
                      sortBy === option.value
                        ? "bg-primary/10 font-medium text-primary"
                        : "hover:bg-muted/50",
                    )}
                    key={option.value}
                    onClick={() => onSortByChange(option.value)}
                  >
                    <span className="flex w-full items-center justify-between">
                      <span>{option.label}</span>
                      <span
                        className={cn(
                          "text-sm",
                          sortBy === option.value ? "opacity-100" : "opacity-0",
                        )}
                      >
                        ✓
                      </span>
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row"></div>
      </div>
    </div>
  );
}
