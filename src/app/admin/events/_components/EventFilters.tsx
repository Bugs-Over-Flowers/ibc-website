"use client";

import { Menu } from "@base-ui/react/menu";
import { ChevronRight, Filter, Search, SortAsc, X } from "lucide-react";
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
import { cn } from "@/lib/utils";

const SORT_LABELS: Record<string, string> = {
  "date-desc": "Date Descending",
  "date-asc": "Date Ascending",
  "title-asc": "Title Ascending",
  "title-desc": "Title Descending",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  "published-public": "Published · Public",
  "published-private": "Published · Private",
  finished: "Finished",
  "finished-public": "Finished · Public",
  "finished-private": "Finished · Private",
};

export default function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentSearch = searchParams.get("search") || "";

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams);

      if (value && value !== "all" && value !== "date-desc") {
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
      (value: string) => updateFilter("search", value || null),
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
    router.push(qs ? (`?${qs}` as Route) : ("/admin/events" as Route));
  };

  const clearFilters = () => {
    setSearchValue("");
    router.push("/admin/events" as Route);
  };

  const hasActiveFilters = currentSort || currentStatus || currentSearch;

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
            autoComplete="off"
            className="h-10 rounded-xl border-border/40 bg-background/80 pr-12 pl-12 text-base transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-primary/20"
            data-form-type="other"
            data-lpignore="true"
            name="event-search"
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search title or venue..."
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
          {/* Sort Select */}
          <Select
            onValueChange={(value) => updateFilter("sort", value)}
            value={currentSort || "date-desc"}
          >
            <SelectTrigger className="w-full sm:w-48">
              <div className="flex items-center gap-1.5">
                <SortAsc className="h-4 w-4 text-muted-foreground" />
                <SelectValue aria-label="Sort events" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort Order</SelectLabel>
                <SelectItem value="date-desc">Date Descending</SelectItem>
                <SelectItem value="date-asc">Date Ascending</SelectItem>
                <SelectItem value="title-asc">Title Ascending</SelectItem>
                <SelectItem value="title-desc">Title Descending</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Status Filter Menu */}
          <Menu.Root>
            <Menu.Trigger
              className={cn(
                "flex h-9 w-full items-center gap-2 rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-xs sm:w-44",
                "hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-1",
              )}
            >
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span>
                {currentStatus
                  ? (STATUS_LABELS[currentStatus] ?? "All Status")
                  : "All Status"}
              </span>
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner className="z-50 outline-none" sideOffset={8}>
                <Menu.Popup className="menu-popup">
                  <Menu.Item
                    className="menu-item"
                    onClick={() => updateFilter("status", null)}
                  >
                    All Status
                  </Menu.Item>
                  <Menu.Item
                    className="menu-item"
                    onClick={() => updateFilter("status", "draft")}
                  >
                    Draft
                  </Menu.Item>

                  {/* Published submenu */}
                  <Menu.SubmenuRoot>
                    <Menu.SubmenuTrigger className="menu-submenu-trigger">
                      Published
                      <ChevronRight size={14} />
                    </Menu.SubmenuTrigger>
                    <Menu.Portal>
                      <Menu.Positioner
                        alignOffset={-4}
                        className="z-50 outline-none"
                        sideOffset={-4}
                      >
                        <Menu.Popup className="menu-popup">
                          <Menu.Item
                            className="menu-item"
                            onClick={() => updateFilter("status", "published")}
                          >
                            All
                          </Menu.Item>
                          <Menu.Item
                            className="menu-item"
                            onClick={() =>
                              updateFilter("status", "published-public")
                            }
                          >
                            Public
                          </Menu.Item>
                          <Menu.Item
                            className="menu-item"
                            onClick={() =>
                              updateFilter("status", "published-private")
                            }
                          >
                            Private
                          </Menu.Item>
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.SubmenuRoot>

                  {/* Finished submenu */}
                  <Menu.SubmenuRoot>
                    <Menu.SubmenuTrigger className="menu-submenu-trigger">
                      Finished
                      <ChevronRight size={14} />
                    </Menu.SubmenuTrigger>
                    <Menu.Portal>
                      <Menu.Positioner
                        alignOffset={-4}
                        className="z-50 outline-none"
                        sideOffset={-4}
                      >
                        <Menu.Popup className="menu-popup">
                          <Menu.Item
                            className="menu-item"
                            onClick={() => updateFilter("status", "finished")}
                          >
                            All
                          </Menu.Item>
                          <Menu.Item
                            className="menu-item"
                            onClick={() =>
                              updateFilter("status", "finished-public")
                            }
                          >
                            Public
                          </Menu.Item>
                          <Menu.Item
                            className="menu-item"
                            onClick={() =>
                              updateFilter("status", "finished-private")
                            }
                          >
                            Private
                          </Menu.Item>
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.SubmenuRoot>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>

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
                    Status:{" "}
                    {currentStatus.startsWith("published") && "Published"}
                    {currentStatus.startsWith("finished") && "Finished"}
                    {currentStatus === "draft" && "Draft"}
                    <button
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
                        className="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                        onClick={() => {
                          const baseStatus =
                            currentStatus.split("-")[0] || "all";
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
