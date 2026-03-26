"use client";

import { Menu } from "@base-ui/react/menu";
import { ChevronRight, Filter, SortAsc, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import ActiveFilterBadges from "@/app/admin/events/_components/event-filters/ActiveFilterBadges";
import { STATUS_LABELS } from "@/app/admin/events/_components/event-filters/constants";
import EventSearchBar from "@/app/admin/events/_components/event-filters/EventSearchBar";
import { useEventFilters } from "@/app/admin/events/_hooks/useEventFilters";
import { Button } from "@/components/ui/button";
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

export default function EventFilters() {
  const {
    currentSort,
    currentStatus,
    currentSearch,
    searchValue,
    hasActiveFilters,
    updateFilter,
    removeFilter,
    clearFilters,
    handleSearchChange,
  } = useEventFilters();

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      {/* Search + Filters Row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search Bar */}
        <EventSearchBar
          onSearchChange={handleSearchChange}
          searchValue={searchValue}
        />

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
      <ActiveFilterBadges
        currentSearch={currentSearch}
        currentSort={currentSort}
        currentStatus={currentStatus}
        removeFilter={removeFilter}
        updateFilter={updateFilter}
      />
    </div>
  );
}
