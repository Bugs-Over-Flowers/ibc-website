"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { ServerFunction } from "@/lib/server/types";

interface UseActionOptions<TOutput, TError = Error | string> {
  onSuccess?: (data: TOutput) => void;
  onError?: (error: TError) => void;
}

interface UseOptimisticActionOptions<
  TInput extends unknown[],
  TOutput,
  TOptimisticState,
  TError = Error | string,
> extends UseActionOptions<TOutput, TError> {
  /**
   * Creates the optimistic state update from input args.
   * Runs inside `startTransition`.
   */
  optimisticUpdate: (
    prev: TOptimisticState,
    ...args: TInput
  ) => TOptimisticState;

  /**
   * Called when the action fails. You can decide how to rollback.
   * If not provided, the hook will attempt an automatic rollback by restoring
   * the previous state snapshot.
   */
  rollback?: (
    prevSnapshot: TOptimisticState,
    current: TOptimisticState,
    error: TError,
    ...args: TInput
  ) => TOptimisticState;

  /**
   * Sync optimistic state with the server result after success.
   * If omitted, the optimistic state is left as-is.
   */
  commit?: (
    current: TOptimisticState,
    result: TOutput,
    ...args: TInput
  ) => TOptimisticState;
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
export function useAction<
  TInput extends unknown[],
  TOutput,
  TError = Error | string,
>(
  action: ServerFunction<TInput, TOutput, TError>,
  options: UseActionOptions<TOutput, TError> = {},
) {
  const [error, setError] = useState<TError | null>(null);
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

/**
 * Like `useAction`, but also maintains an optimistic state using React's `useOptimistic`.
 *
 * Notes:
 * - This is intended for UI state updates (lists, counters, toggles, etc.)
 * - You control how to optimistically update (`optimisticUpdate`) and how to
 *   reconcile (`commit`) or rollback (`rollback`).
 *
 * @example
 * const { execute, optimistic, isPending } = useOptimisticAction(
 *   tryCatch(addTodo),
 *   todos,
 *   {
 *     optimisticUpdate: (prev, input) => [
 *       { id: "temp", title: input.title, pending: true },
 *       ...prev,
 *     ],
 *     commit: (current, result) =>
 *       current.map((t) => (t.id === "temp" ? result.todo : t)),
 *   },
 * );
 */
export function useOptimisticAction<
  TInput extends unknown[],
  TOutput,
  TOptimisticState,
  TError = Error | string,
>(
  action: ServerFunction<TInput, TOutput, TError>,
  initialOptimisticState: TOptimisticState,
  options: UseOptimisticActionOptions<
    TInput,
    TOutput,
    TOptimisticState,
    TError
  >,
) {
  const [error, setError] = useState<TError | null>(null);
  const [data, setData] = useState<TOutput | null>(null);

  const [isPending, startTransition] = useTransition();

  const [optimistic, setOptimistic] = useOptimistic<TOptimisticState>(
    initialOptimisticState,
  );

  async function execute(...args: TInput) {
    setError(null);
    setData(null);

    const prevSnapshot = optimistic;

    startTransition(() => {
      setOptimistic(options.optimisticUpdate(prevSnapshot, ...args));
    });

    const res = await action(...args);

    if (!res.success) {
      setError(res.error);
      options.onError?.(res.error);

      startTransition(() => {
        const rolledBack = options.rollback
          ? options.rollback(prevSnapshot, optimistic, res.error, ...args)
          : prevSnapshot;

        setOptimistic(rolledBack);
      });

      return res;
    }

    setData(res.data);
    options.onSuccess?.(res.data);

    const commit = options.commit;

    if (typeof commit === "function") {
      startTransition(() => {
        setOptimistic(commit(optimistic, res.data, ...args));
      });
    }

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
    optimistic,
  };
}
