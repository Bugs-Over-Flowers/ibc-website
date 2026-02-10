"use client";

import { Filter, Search, SortAsc } from "lucide-react";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEventFilters } from "../_hooks/useEventFilters";

export default function EventFilters() {
  const { updateSort, updateStatus, updateSearch, searchParams } =
    useEventFilters();
  const [searchValue, setSearchValue] = useState("");
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
      className="grid grid-cols-2 gap-3 xl:grid-cols-12 xl:gap-4"
      onSubmit={handleSubmit}
    >
      <div className="relative col-span-1 xl:col-span-7">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-foreground" />
        <Input
          autoComplete="off"
          className="w-full border-border pl-10"
          data-form-type="other"
          data-lpignore="true"
          name="event-search"
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search title or venue..."
          value={searchValue}
        />
      </div>

      <div className="col-span-1 flex items-stretch">
        <Button
          aria-label="Search"
          className="w-full"
          type="submit"
          variant="default"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="col-span-2">
        <Select
          onValueChange={updateSort}
          value={searchParams.get("sort") || "date-asc"}
        >
          <SelectTrigger className="w-full border-border">
            <div className="flex items-center gap-2">
              <SortAsc size={16} />
              <span className="hidden xl:inline">
                <SelectValue aria-label="Sort By Date" />
              </span>
              <span className="xl:hidden">Sort</span>
            </div>
          </SelectTrigger>
          <SelectContent className="w-auto">
            <SelectItem value="date-asc">Date (Ascending)</SelectItem>
            <SelectItem value="date-desc">Date (Descending)</SelectItem>
            <SelectItem value="title-asc">Title (A → Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z → A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-2">
        <Select
          onValueChange={updateStatus}
          value={searchParams.get("status") || "all"}
        >
          <SelectTrigger className="w-full border-border">
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <span className="hidden xl:inline">
                <SelectValue aria-label="Filter By Status" />
              </span>
              <span className="xl:hidden">Filter</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="finished">Finished</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </form>
  );
}
