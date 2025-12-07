"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import type { ServerFunction } from "@/lib/server/types";

interface UseActionOptions<TOutput> {
  onSuccess?: (data: TOutput) => void;
  onError?: (error: string) => void;
}

export function useAction<TInput, TOutput>(
  action: ServerFunction<[TInput], TOutput>,
  options: UseActionOptions<TOutput> = {},
) {
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TOutput | null>(null);
  const [isPending, startTransition] = useTransition();

  // Keep options in a ref so we can use the latest version in execute
  // without needing to include it in the dependency array
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const execute = useCallback(
    async (input: TInput) => {
      setError(null);

      startTransition(async () => {
        const res = await action(input);
        if (res[0] !== null) {
          setError(res[0]);
          optionsRef.current.onError?.(res[0]);
          return;
        }

        setData(res[1]);
        optionsRef.current.onSuccess?.(res[1]);
      });
    },
    [action],
  );

  const reset = useCallback(() => {
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    data,
    error,
    isPending,
    reset,
  };
}
