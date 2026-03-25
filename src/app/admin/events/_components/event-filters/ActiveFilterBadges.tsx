"use client";

import { Filter, Search, SortAsc, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { SORT_LABELS } from "@/app/admin/events/_components/event-filters/constants";

interface ActiveFilterBadgesProps {
  currentSort: string;
  currentStatus: string;
  currentSearch: string;
  removeFilter: (key: string) => void;
  updateFilter: (key: string, value: string | null) => void;
}

export default function ActiveFilterBadges({
  currentSort,
  currentStatus,
  currentSearch,
  removeFilter,
  updateFilter,
}: ActiveFilterBadgesProps) {
  const hasActiveFilters = currentSort || currentStatus || currentSearch;

  return (
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

            {currentSort && (
              <motion.span
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                key="sort-filter"
                transition={{ duration: 0.2 }}
              >
                <SortAsc className="h-3 w-3" />
                Sort: {SORT_LABELS[currentSort] || currentSort}
                <button
                  aria-label="Remove sort filter"
                  className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                  onClick={() => removeFilter("sort")}
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            )}

            {currentStatus && (
              <>
                <motion.span
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  key="status-filter"
                  transition={{ duration: 0.2 }}
                >
                  <Filter className="h-3 w-3" />
                  Status: {currentStatus.startsWith("published") && "Published"}
                  {currentStatus.startsWith("finished") && "Finished"}
                  {currentStatus === "draft" && "Draft"}
                  <button
                    aria-label="Remove status filter"
                    className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                    onClick={() => removeFilter("status")}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
                {(currentStatus === "published-public" ||
                  currentStatus === "published-private" ||
                  currentStatus === "finished-public" ||
                  currentStatus === "finished-private") && (
                  <motion.span
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                    key="subtype-filter"
                    transition={{ duration: 0.2 }}
                  >
                    <Filter className="h-3 w-3" />
                    {(currentStatus === "published-public" ||
                      currentStatus === "finished-public") &&
                      "Public"}
                    {(currentStatus === "published-private" ||
                      currentStatus === "finished-private") &&
                      "Private"}
                    <button
                      aria-label={`Remove ${currentStatus === "published-public" || currentStatus === "finished-public" ? "public" : "private"} filter`}
                      className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                      onClick={() => {
                        const baseStatus = currentStatus.split("-")[0] || "all";
                        updateFilter("status", baseStatus);
                      }}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                )}
              </>
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
                  aria-label="Remove search filter"
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
  );
}
