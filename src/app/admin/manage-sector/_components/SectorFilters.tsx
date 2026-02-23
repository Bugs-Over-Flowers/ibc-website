"use client";

import { Search } from "lucide-react";
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

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      submitSearch();
    },
    [submitSearch],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitSearch();
      }
    },
    [submitSearch],
  );

  return (
    <form
      className="grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-4"
      onSubmit={handleSubmit}
    >
      <div className="relative col-span-2 md:col-span-11">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-foreground" />
        <Input
          autoComplete="off"
          className="w-full border-border pl-10"
          data-form-type="other"
          data-lpignore="true"
          name="sector-search"
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search sector name..."
          value={searchValue}
        />
      </div>

      <div className="col-span-2 flex items-stretch md:col-span-1">
        <Button
          aria-label="Search"
          className="w-full"
          type="submit"
          variant="default"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
