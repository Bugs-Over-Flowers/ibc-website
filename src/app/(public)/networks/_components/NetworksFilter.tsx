"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownAZ, ArrowUpZA, Search, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "newest" | "oldest";

interface NetworksFilterProps {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  sortBy: SortOption;
  setSortBy: Dispatch<SetStateAction<SortOption>>;
  filteredCount: number;
}

export function NetworksFilter({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  filteredCount,
}: NetworksFilterProps) {
  return (
    <section className="border-border border-b bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border/30 bg-card/60 p-4 shadow-xl backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-5 w-5 text-muted-foreground/70" />
              </div>
              <Input
                className="h-14 rounded-xl border-border/40 bg-background/80 pr-12 pl-12 text-base transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by organization..."
                type="text"
                value={searchQuery}
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.div
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-y-0 right-2 flex items-center"
                    exit={{ opacity: 0, scale: 0.8 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                  >
                    <Button
                      className="h-8 w-8 rounded-full hover:bg-muted/60"
                      onClick={() => setSearchQuery("")}
                      size="icon"
                      variant="ghost"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Select
                onValueChange={(value) => setSortBy(value as SortOption)}
                value={sortBy}
              >
                <SelectTrigger className="h-12 flex-1 rounded-xl border-border/40 bg-background/80 text-base">
                  <div className="flex items-center gap-2">
                    {sortBy === "newest" ? (
                      <ArrowUpZA className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ArrowDownAZ className="h-4 w-4 text-muted-foreground" />
                    )}
                    <SelectValue placeholder="Sort" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-muted-foreground/70 text-sm">
                Showing {filteredCount}{" "}
                {filteredCount === 1 ? "network" : "networks"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
