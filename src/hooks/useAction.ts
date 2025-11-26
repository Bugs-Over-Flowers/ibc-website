"use client";

import { useState, useTransition } from "react";
import type { toast } from "sonner";
import handleActionResult from "@/lib/actions/handleActionResult";
import type { ServerAction } from "@/lib/actions/types";

interface UseActionOptions<TOutput> {
  onSuccess?: (data: TOutput) => void;
  onError?: (error: string) => void;
  successToast?: Parameters<typeof toast.success>;
  errorToast?: Parameters<typeof toast.error>;
}

export function useAction<TInput, TOutput>(
  action: ServerAction<[TInput], TOutput>,
  options: UseActionOptions<TOutput> = {}
) {
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TOutput | null>(null);
  const [isPending, startTransition] = useTransition();

  async function execute(input: TInput) {
    setError(null);

    startTransition(async () => {
      const result = await action(input);

      handleActionResult(result, {
        onSuccess: (resultData) => {
          setData(resultData);
          options.onSuccess?.(resultData);
        },
        onError: (err) => {
          setError(err);
          options.onError?.(err);
        },
        successToast: options.successToast,
        errorToast: options.errorToast,
      });
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
