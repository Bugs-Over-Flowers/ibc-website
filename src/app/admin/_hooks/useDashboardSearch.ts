"use client";

import { useEffect, useMemo, useState } from "react";
import type { DashboardActivityItem } from "@/server/admin/queries/getDashboardData";

type UseDashboardSearchOptions = {
  initialActivities: DashboardActivityItem[];
  debounceMs?: number;
};

export function useDashboardSearch({
  initialActivities,
  debounceMs = 300,
}: UseDashboardSearchOptions) {
  const [query, setQuery] = useState("");
  const [activities, setActivities] = useState(initialActivities);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialActivitiesMemo = useMemo(
    () => initialActivities,
    [initialActivities],
  );

  useEffect(() => {
    setActivities(initialActivitiesMemo);
  }, [initialActivitiesMemo]);

  useEffect(() => {
    const controller = new AbortController();
    const trimmedQuery = query.trim();

    const timeout = setTimeout(async () => {
      if (!trimmedQuery) {
        setActivities(initialActivitiesMemo);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/admin/dashboard/search?query=${encodeURIComponent(trimmedQuery)}`,
          {
            method: "GET",
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Unable to search dashboard activity");
        }

        const payload = (await response.json()) as {
          activities: DashboardActivityItem[];
          error?: string;
        };

        if (payload.error) {
          throw new Error(payload.error);
        }

        setActivities(payload.activities ?? []);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to search dashboard activity",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query, debounceMs, initialActivitiesMemo]);

  return {
    query,
    setQuery,
    activities,
    isLoading,
    error,
  };
}
