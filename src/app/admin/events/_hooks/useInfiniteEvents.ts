"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import tryCatch from "@/lib/server/tryCatch";
import type { Tables } from "@/lib/supabase/db.types";
import { fetchMoreEvents } from "@/server/events/queries/fetchMoreEvents";
import type { SortOption } from "@/server/events/queries/getAdminEventsPage";

interface UseInfiniteEventsProps {
  initialEvents: (Tables<"Event"> & {
    computedStatus: "draft" | "published" | "finished";
  })[];
  initialNextCursor: string | null;
  search?: string;
  sort?: SortOption;
  status?: string;
}

export function useInfiniteEvents({
  initialEvents,
  initialNextCursor,
  search,
  sort,
  status,
}: UseInfiniteEventsProps) {
  const [events, setEvents] = useState(initialEvents);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Reset list when initial payload changes (new navigation/search triggers server re-fetch)
  useEffect(() => {
    setEvents(initialEvents);
    setNextCursor(initialNextCursor);
    setHasError(false);
    setIsLoading(false);
    // Only depend on props that the effect uses - parent provides fresh data when filters change
  }, [initialEvents, initialNextCursor]);

  // Fetch more events
  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoading) return;

    setIsLoading(true);
    setHasError(false);

    const { success, data, error } = await tryCatch(
      fetchMoreEvents({
        search,
        sort,
        status,
        cursor: nextCursor,
      }),
    );

    setIsLoading(false);

    if (!success || !data) {
      setHasError(true);
      console.error("Failed to load more events:", error);
      return;
    }

    setEvents((prev) => [...prev, ...data.items]);
    setNextCursor(data.nextCursor);
  }, [nextCursor, isLoading, search, sort, status]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [nextCursor, isLoading, loadMore]);

  return { events, isLoading, hasError, observerTarget };
}
