import type { AsyncFunction, AsyncResult } from "./types";

function tryCatch<TInput extends unknown[], TOutput>(
  fn: (...args: TInput) => Promise<TOutput>,
): AsyncFunction<TInput, TOutput, string>;

function tryCatch<TOutput>(
  promise: Promise<TOutput>,
): Promise<AsyncResult<TOutput, string>>;

function tryCatch<TInput extends unknown[], TOutput>(
  fnOrPromise: ((...args: TInput) => Promise<TOutput>) | Promise<TOutput>,
):
  | AsyncFunction<TInput, TOutput, string>
  | Promise<AsyncResult<TOutput, string>> {
  const handleSuccess = (data: TOutput): AsyncResult<TOutput, string> => ({
    success: true,
    data,
    error: null,
  });

  const handleError = (error: unknown): AsyncResult<TOutput, string> => {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, data: null, error: message };
  };

  if (fnOrPromise instanceof Promise) {
    return fnOrPromise.then(handleSuccess).catch(handleError);
  }

  return async (...args: TInput) => {
    try {
      const data = await fnOrPromise(...args);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  };
}

export default tryCatch;
