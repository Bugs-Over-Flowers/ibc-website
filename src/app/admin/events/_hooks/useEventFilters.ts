"use client";

import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useSearchInput } from "@/app/admin/events/_hooks/useSearchInput";

export function useEventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentSearch = searchParams.get("search") || "";

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams);

      if (key === "sort") {
        if (value && value !== "date-desc") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      } else if (key === "status") {
        if (value && value !== "all") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      } else if (key === "search") {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      } else {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      const qs = params.toString();
      router.push(qs ? (`?${qs}` as Route) : ("/admin/events" as Route));
    },
    [searchParams, router],
  );

  const { searchValue, setSearchValue, handleSearchChange } = useSearchInput({
    initialValue: currentSearch,
    onSearch: useCallback(
      (value: string) => updateFilter("search", value || null),
      [updateFilter],
    ),
    debounceMs: 400,
  });

  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch, setSearchValue]);

  const removeFilter = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams);
      params.delete(key);

      if (key === "search") {
        setSearchValue("");
      }

      const qs = params.toString();
      router.push(qs ? (`?${qs}` as Route) : ("/admin/events" as Route));
    },
    [searchParams, router, setSearchValue],
  );

  const clearFilters = useCallback(() => {
    setSearchValue("");
    router.push("/admin/events" as Route);
  }, [router, setSearchValue]);

  const hasActiveFilters = currentSort || currentStatus || currentSearch;

  return {
    currentSort,
    currentStatus,
    currentSearch,
    searchValue,
    hasActiveFilters,
    updateFilter,
    removeFilter,
    clearFilters,
    handleSearchChange,
  };
}
