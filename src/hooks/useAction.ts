"use client";

import { useState } from "react";
import type { ServerFunction } from "@/lib/server/types";

interface UseActionOptions<TOutput> {
  onSuccess?: (data: TOutput) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for executing server actions with loading states and error handling.
 *
 * @example
 * // With input
 * const { execute, isPending } = useAction(tryCatch(createItem), {
 *   onSuccess: (data) => router.push(`/items/${data.id}`),
 *   onError: (error) => toast.error(error.message),
 * });
 * execute({ name: "New Item" });
 *
 * @example
 * // Without input
 * const { execute, isPending } = useAction(tryCatch(refreshData));
 * execute();
 */
export function useAction<TInput extends unknown[], TOutput>(
  action: ServerFunction<TInput, TOutput, Error>,
  options: UseActionOptions<TOutput> = {},
) {
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TOutput | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function execute(...args: TInput) {
    setError(null);
    setData(null);
    setIsPending(true);

    const res = await action(...args);

    if (!res.success) {
      setError(res.error);
      options.onError?.(res.error);
      setIsPending(false);
      return res;
    }

    setData(res.data);
    options.onSuccess?.(res.data);
    setIsPending(false);
    return res;
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
