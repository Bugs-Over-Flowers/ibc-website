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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-foreground " />
          </div>
          <Input
            type="text"
            placeholder="Search events..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-12 pr-12 py-6 text-base bg-white/80 backdrop-blur-xl border-border/50 ring-1 ring-white/30 shadow-lg rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="absolute inset-y-0 right-2 my-auto h-8 w-8 hover:bg-muted/50"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          )}
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-[52px] px-5 bg-white/80 backdrop-blur-xl border-border/50 ring-1 ring-white/30 shadow-lg rounded-xl hover:bg-white/90 min-w-[140px] justify-between"
            >
              {filterLabels[currentFilter]}
              <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[140px] bg-white/95 backdrop-blur-xl border-border/50 shadow-xl rounded-xl"
          >
            <DropdownMenuItem
              onClick={() => onFilterChange("all")}
              className={
                currentFilter === "all" ? "bg-primary/10 text-primary" : ""
              }
            >
              All Events
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange("upcoming")}
              className={
                currentFilter === "upcoming" ? "bg-primary/10 text-primary" : ""
              }
            >
              Upcoming
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange("past")}
              className={
                currentFilter === "past" ? "bg-primary/10 text-primary" : ""
              }
            >
              Past Events
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
