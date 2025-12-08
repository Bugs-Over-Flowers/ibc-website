import type { ServerFunction, ServerFunctionResult } from "./types";

function tryCatch<TInput extends unknown[], TOutput>(
  fn: (...args: TInput) => Promise<TOutput>,
): ServerFunction<TInput, TOutput, Error>;

function tryCatch<TOutput>(
  promise: Promise<TOutput>,
): Promise<ServerFunctionResult<TOutput>>;

function tryCatch<TInput extends unknown[], TOutput>(
  fnOrPromise: ((...args: TInput) => Promise<TOutput>) | Promise<TOutput>,
): ServerFunction<TInput, TOutput> | Promise<ServerFunctionResult<TOutput>> {
  const handleSuccess = (data: TOutput): ServerFunctionResult<TOutput> => ({
    success: true,
    data,
    error: null,
  });

  const handleError = (error: unknown): ServerFunctionResult<TOutput> => {
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
