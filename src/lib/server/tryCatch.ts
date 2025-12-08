import type { ServerFunction, ServerFunctionResult } from "./types";

/**
 * Utility for converting throwing functions/promises into `[error, data]` tuples.
 *
 * Supports two usage patterns:
 *
 * 1. **Wrap a function** (for use with `useAction`):
 * ```ts
 * const { execute } = useAction(tryCatch(createItem), {
 *   onSuccess: (data) => console.log(data),
 * });
 * execute({ name: "New Item" });
 * ```
 *
 * 2. **Wrap a promise** (for inline use):
 * ```ts
 * const [error, data] = await tryCatch(createItem(input));
 * if (error) {
 *   console.error(error);
 *   return;
 * }
 * console.log(data);
 * ```
 */
function tryCatch<TInput extends unknown[], TOutput>(
  fn: (...args: TInput) => Promise<TOutput>,
): ServerFunction<TInput, TOutput>;

function tryCatch<TOutput>(
  promise: Promise<TOutput>,
): Promise<ServerFunctionResult<TOutput>>;

function tryCatch<TInput extends unknown[], TOutput>(
  fnOrPromise: ((...args: TInput) => Promise<TOutput>) | Promise<TOutput>,
): ServerFunction<TInput, TOutput> | Promise<ServerFunctionResult<TOutput>> {
  // If it's a promise, wrap it directly
  if (fnOrPromise instanceof Promise) {
    return fnOrPromise
      .then((data): ServerFunctionResult<TOutput> => [null, data])
      .catch((error): ServerFunctionResult<TOutput> => {
        const message = error instanceof Error ? error.message : String(error);
        return [message, null];
      });
  }

  // If it's a function, return a wrapped function
  return async (...args: TInput): Promise<ServerFunctionResult<TOutput>> => {
    try {
      const data = await fnOrPromise(...args);
      return [null, data];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return [message, null];
    }
  };
}

export default tryCatch;
