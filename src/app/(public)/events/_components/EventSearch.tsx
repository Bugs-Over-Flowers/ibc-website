"use client";

import { motion } from "framer-motion";
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
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-3xl"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-foreground" />
          </div>
          <Input
            className="rounded-xl border-border/50 bg-white/80 py-6 pr-12 pl-12 text-base shadow-lg ring-1 ring-white/30 backdrop-blur-xl transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="h-[52px] min-w-[140px] justify-between rounded-xl border-border/50 bg-white/80 px-5 shadow-lg ring-1 ring-white/30 backdrop-blur-xl hover:bg-white/90"
              variant="outline"
            >
              {filterLabels[currentFilter]}
              <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
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
    </motion.div>
  );
}
