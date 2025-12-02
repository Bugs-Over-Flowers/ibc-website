"use client";

import { useState, useTransition } from "react";
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

  async function execute(input: TInput) {
    setError(null);

    startTransition(async () => {
      const res = await action(input);
      if (res[0] !== null) {
        setError(res[0]);
        options.onError?.(res[0]);
        return;
      }

      setData(res[1]);
      options.onSuccess?.(res[1]);
    });
  }

  function reset() {
    setError(null);
    setData(null);
  }

  return {
    execute,
    data,
    error,
    isPending,
    reset,
  };
}
