"use client";

import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useSearchInput } from "@/app/admin/events/_hooks/useSearchInput";

type DateSortValue = "date-asc" | "date-desc" | null;
type TitleSortValue = "title-asc" | "title-desc" | null;

export function useEventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "";
  const currentDateSort = searchParams.get("dateSort") || "";
  const currentTitleSort = searchParams.get("titleSort") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentSearch = searchParams.get("search") || "";

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams);

      if (key === "dateSort") {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      } else if (key === "titleSort") {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      } else if (key === "sort") {
        // Backward compatibility for old links.
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

  const updateSortFilters = useCallback(
    ({
      dateSort,
      titleSort,
    }: {
      dateSort: DateSortValue;
      titleSort: TitleSortValue;
    }) => {
      const params = new URLSearchParams(searchParams);

      // Drop legacy combined sort once explicit sort filters are used.
      params.delete("sort");

      if (dateSort) {
        params.set("dateSort", dateSort);
      } else {
        params.delete("dateSort");
      }

      if (titleSort) {
        params.set("titleSort", titleSort);
      } else {
        params.delete("titleSort");
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
      const rawDateSort = searchParams.get("dateSort");
      const rawTitleSort = searchParams.get("titleSort");
      const hasExplicitSort = Boolean(rawDateSort || rawTitleSort);

      if (key === "dateSort") {
        // Date-desc is the only implicit default sort. Keep at least one sort active.
        if (!hasExplicitSort) {
          return;
        } else {
          params.delete("dateSort");
        }
      } else if (key === "titleSort") {
        // If no explicit sorts are present, there's no title sort to remove.
        if (!hasExplicitSort) {
          return;
        } else {
          params.delete("titleSort");
        }
      } else {
        params.delete(key);
      }

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

  const hasExplicitSort = Boolean(currentDateSort || currentTitleSort);
  const effectiveDateSort = hasExplicitSort ? currentDateSort : "date-desc";
  const effectiveTitleSort = hasExplicitSort ? currentTitleSort : "";
  const hasNonDefaultDateSort = effectiveDateSort !== "date-desc";
  const hasNonDefaultTitleSort = effectiveTitleSort !== "";
  const hasDisabledDefaultSort = hasExplicitSort && !currentDateSort;
  const hasActiveFilters =
    hasNonDefaultDateSort ||
    hasNonDefaultTitleSort ||
    hasDisabledDefaultSort ||
    currentSort ||
    currentStatus ||
    currentSearch;

  return {
    currentSort,
    currentDateSort,
    currentTitleSort,
    currentStatus,
    currentSearch,
    searchValue,
    hasActiveFilters,
    updateFilter,
    updateSortFilters,
    removeFilter,
    clearFilters,
    handleSearchChange,
  };
}
