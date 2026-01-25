"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useEventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}` as Route);
    },
    [searchParams, pathname, router],
  );

  const updateSort = useCallback(
    (value: string | null) => updateFilter("sort", value),
    [updateFilter],
  );

  const updateStatus = useCallback(
    (value: string | null) =>
      updateFilter("status", value === "all" ? null : value),
    [updateFilter],
  );

  const updateSearch = useCallback(
    (value: string) => updateFilter("search", value || null),
    [updateFilter],
  );

  return {
    updateFilter,
    updateSort,
    updateStatus,
    updateSearch,
    searchParams,
  };
}
