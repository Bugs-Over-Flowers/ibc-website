"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EventSearchInputProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function EventSearchInput({
  searchQuery,
  onSearchChange,
}: EventSearchInputProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Search className="h-5 w-5 text-muted-foreground/70" />
      </div>
      <Input
        className="h-14 rounded-xl border-border/40 bg-background/80 pr-12 pl-12 text-base transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search events by name, description, or venue..."
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
              onClick={() => onSearchChange("")}
              size="icon"
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
