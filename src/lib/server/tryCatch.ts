import type { ServerFunction, ServerFunctionResult } from "./types";

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === "string") {
    return new Error(error);
  }
  return new Error(String(error));
}

function tryCatch<TInput extends unknown[], TOutput>(
  fn: (...args: TInput) => Promise<TOutput>,
): ServerFunction<TInput, TOutput, Error>;

function tryCatch<TOutput>(
  promise: Promise<TOutput>,
): Promise<ServerFunctionResult<TOutput, Error>>;

function tryCatch<TInput extends unknown[], TOutput = string>(
  fnOrPromise: ((...args: TInput) => Promise<TOutput>) | Promise<TOutput>,
):
  | ServerFunction<TInput, TOutput, Error>
  | Promise<ServerFunctionResult<TOutput, Error>> {
  if (typeof fnOrPromise === "function") {
    return async (
      ...args: TInput
    ): Promise<ServerFunctionResult<TOutput, Error>> => {
      try {
        const result = await fnOrPromise(...args);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: toError(error) };
      }
    };
  } else {
    return fnOrPromise.then(
      (data): ServerFunctionResult<TOutput, Error> => ({
        success: true,
        data,
      }),
      (error): ServerFunctionResult<TOutput, Error> => ({
        success: false,
        error: toError(error),
      }),
    );
  }
}

export default tryCatch;
