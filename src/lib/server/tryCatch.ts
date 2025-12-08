import type { ServerFunction, ServerFunctionResult } from "./types";

function tryCatch<TInput extends unknown[], TOutput>(
  fn: (...args: TInput) => Promise<TOutput>,
): ServerFunction<TInput, TOutput, string>;

function tryCatch<TOutput>(
  promise: Promise<TOutput>,
): Promise<ServerFunctionResult<TOutput, string>>;

function tryCatch<TInput extends unknown[], TOutput = string>(
  fnOrPromise: ((...args: TInput) => Promise<TOutput>) | Promise<TOutput>,
):
  | ServerFunction<TInput, TOutput, string>
  | Promise<ServerFunctionResult<TOutput, string>> {
  const handleSuccess = (
    data: TOutput,
  ): ServerFunctionResult<TOutput, string> => ({
    success: true,
    data,
    error: null,
  });

  const handleError = (
    error: unknown,
  ): ServerFunctionResult<TOutput, string> => {
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
