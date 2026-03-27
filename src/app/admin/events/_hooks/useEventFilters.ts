"use client";

import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useSearchInput } from "@/app/admin/events/_hooks/useSearchInput";

type DateSortValue = "date-asc" | "date-desc" | null;
type TitleSortValue = "title-asc" | "title-desc" | null;

const DATE_SORT_VALUES = ["date-asc", "date-desc"] as const;
const TITLE_SORT_VALUES = ["title-asc", "title-desc"] as const;

function normalizeDateSort(value: string | null): DateSortValue {
  return DATE_SORT_VALUES.includes(value as (typeof DATE_SORT_VALUES)[number])
    ? (value as DateSortValue)
    : null;
}

function normalizeTitleSort(value: string | null): TitleSortValue {
  return TITLE_SORT_VALUES.includes(value as (typeof TITLE_SORT_VALUES)[number])
    ? (value as TitleSortValue)
    : null;
}

function resolveSortState(
  dateSort: string | null,
  titleSort: string | null,
): {
  explicitDateSort: DateSortValue;
  explicitTitleSort: TitleSortValue;
  effectiveDateSort: "date-asc" | "date-desc";
  effectiveTitleSort: TitleSortValue;
  hasExplicitSort: boolean;
} {
  const explicitDateSort = normalizeDateSort(dateSort);
  const explicitTitleSort = normalizeTitleSort(titleSort);
  const hasExplicitSort = Boolean(explicitDateSort || explicitTitleSort);

  return {
    explicitDateSort,
    explicitTitleSort,
    // Baseline default: Latest First when no explicit sorts are set.
    effectiveDateSort: hasExplicitSort
      ? (explicitDateSort ?? "date-desc")
      : "date-desc",
    effectiveTitleSort: hasExplicitSort ? explicitTitleSort : null,
    hasExplicitSort,
  };
}

export function useEventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "";
  const rawDateSort = searchParams.get("dateSort");
  const rawTitleSort = searchParams.get("titleSort");
  const {
    explicitDateSort,
    explicitTitleSort,
    effectiveDateSort,
    effectiveTitleSort,
    hasExplicitSort,
  } = resolveSortState(rawDateSort, rawTitleSort);
  const currentDateSort = explicitDateSort ?? "";
  const currentTitleSort = explicitTitleSort ?? "";
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

      const normalizedDateSort = normalizeDateSort(dateSort);
      const normalizedTitleSort = normalizeTitleSort(titleSort);

      // Drop legacy combined sort once explicit sort filters are used.
      params.delete("sort");

      if (normalizedDateSort) {
        params.set("dateSort", normalizedDateSort);
      } else {
        params.delete("dateSort");
      }

      if (normalizedTitleSort) {
        params.set("titleSort", normalizedTitleSort);
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
      const { hasExplicitSort } = resolveSortState(rawDateSort, rawTitleSort);

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

  const hasNonDefaultDateSort = effectiveDateSort !== "date-desc";
  const hasNonDefaultTitleSort = effectiveTitleSort !== null;
  const hasDisabledDefaultSort = hasExplicitSort && !explicitDateSort;
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
    effectiveDateSort,
    effectiveTitleSort,
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
