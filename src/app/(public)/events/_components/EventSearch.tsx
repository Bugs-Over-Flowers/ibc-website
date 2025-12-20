"use client";

// import { motion } from "framer-motion";
import { ChevronDown, Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

type FilterOption = "all" | "upcoming" | "past";

interface EventsSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: FilterOption) => void;
  currentFilter: FilterOption;
}

const filterLabels: Record<FilterOption, string> = {
  all: "All Events",
  upcoming: "Upcoming",
  past: "Past Events",
};

export function EventsSearch({
  onSearch,
  onFilterChange,
  currentFilter,
}: EventsSearchProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="mb-4 flex flex-col gap-4 sm:flex-row">
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-4 z-10 h-5 w-5 -translate-y-1/2 transform text-foreground/50 drop-shadow-md" />
        <Input
          className="h-[52px] justify-between rounded-xl border border-border/50 bg-white/80 px-5 pl-12 text-foreground shadow-lg ring-1 ring-white/30 backdrop-blur-xl hover:bg-white/90 focus:ring-2 focus:ring-primary/30"
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search events..."
          type="text"
          value={query}
        />
        {query && (
          <Button
            className="absolute inset-y-0 right-2 my-auto h-8 w-8 hover:bg-muted/50"
            onClick={clearSearch}
            size="icon"
            variant="ghost"
          >
            <X className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
          </Button>
        )}
      </div>
      {/* Filter Dropdown */}
      <div className="w-full sm:w-64">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(triggerProps) => (
              <Button
                aria-expanded={false}
                className="h-[52px] w-full min-w-[140px] justify-between rounded-xl border-border/50 bg-white px-5 shadow-lg ring-1 ring-white/30 backdrop-blur-xl hover:bg-white/90"
                role="combobox"
                variant="outline"
                {...triggerProps}
              >
                <span className="block max-w-[140px] truncate text-left">
                  {filterLabels[currentFilter]}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            )}
          />
          <DropdownMenuContent
            align="end"
            className="w-[140px] rounded-xl border-border/50 bg-white/95 shadow-xl backdrop-blur-xl"
          >
            <DropdownMenuItem
              className={
                currentFilter === "all" ? "bg-primary/10 text-primary" : ""
              }
              onClick={() => onFilterChange("all")}
            >
              All Events
            </DropdownMenuItem>
            <DropdownMenuItem
              className={
                currentFilter === "upcoming" ? "bg-primary/10 text-primary" : ""
              }
              onClick={() => onFilterChange("upcoming")}
            >
              Upcoming
            </DropdownMenuItem>
            <DropdownMenuItem
              className={
                currentFilter === "past" ? "bg-primary/10 text-primary" : ""
              }
              onClick={() => onFilterChange("past")}
            >
              Past Events
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
