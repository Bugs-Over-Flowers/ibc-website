"use client";

import { useState } from "react";
import type { ServerFunction } from "@/lib/server/types";

interface UseActionOptions<TOutput> {
  onSuccess?: (data: TOutput) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for executing server actions with loading states and error handling.
 *
 * @example
 * // With input
 * const { execute, isPending } = useAction(tryCatch(createItem), {
 *   onSuccess: (data) => router.push(`/items/${data.id}`),
 *   onError: (error) => toast.error(error),
 * });
 * execute({ name: "New Item" });
 *
 * @example
 * // Without input
 * const { execute, isPending } = useAction(tryCatch(refreshData));
 * execute();
 */
export function useAction<TInput extends unknown[], TOutput>(
  action: ServerFunction<TInput, TOutput>,
  options: UseActionOptions<TOutput> = {},
) {
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TOutput | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function execute(...args: TInput) {
    setError(null);
    setData(null);
    setIsPending(true);

    const res = await action(...args);

    const [error, data] = res;
    if (error !== null) {
      setError(error);
      options.onError?.(error);
      return;
    }

    setData(data);
    options.onSuccess?.(data);
    setIsPending(false);
  }

  function reset() {
    setError(null);
    setData(null);
  }

  return {
    execute,
    data,
    error,
    reset,
    isPending,
  };
}
