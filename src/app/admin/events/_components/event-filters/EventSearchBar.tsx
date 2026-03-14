"use client";

import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EventSearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export default function EventSearchBar({
  searchValue,
  onSearchChange,
}: EventSearchBarProps) {
  return (
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
        onChange={(e) => onSearchChange(e.target.value)}
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
              onClick={() => onSearchChange("")}
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
  );
}
