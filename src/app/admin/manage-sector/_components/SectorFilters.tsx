"use client";

import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSectorFilters } from "../_hooks/useSectorFilters";

export default function SectorFilters() {
  const { updateSearch, searchParams } = useSectorFilters();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || "",
  );
  const deferredSearch = useDeferredValue(searchValue);
  const lastSearchRef = useRef<string | null>(null);

  const submitSearch = useCallback(() => {
    updateSearch(searchValue.trim());
  }, [searchValue, updateSearch]);

  // Auto-search using React's deferred value (avoids setTimeout)
  // Only trigger when the deferred value actually changes from last search
  useEffect(() => {
    const trimmed = deferredSearch.trim();
    const currentUrlSearch = searchParams.get("search") || "";

    // Skip if search hasn't changed from URL or last submitted value
    if (trimmed === currentUrlSearch || trimmed === lastSearchRef.current) {
      return;
    }

    lastSearchRef.current = trimmed;
    updateSearch(trimmed);
  }, [deferredSearch, searchParams, updateSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchValue("");
    updateSearch("");
  }, [updateSearch]);

  return (
    <div className="rounded-xl p-0">
      {/* Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-muted-foreground/70" />
          </div>
          <Input
            autoComplete="off"
            className="h-12 rounded-xl border-border bg-card/80 pr-12 pl-12 text-base transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-primary/20"
            data-form-type="other"
            data-lpignore="true"
            name="sector-search"
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search sector name..."
            type="text"
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
                  onClick={handleClearSearch}
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
      </div>
    </div>
  );
}
