export type ServerFunctionSuccess<T> = { success: true; data: T; error: null };
export type ServerFunctionError<E> = { success: false; error: E; data: null };

export type ServerFunctionResult<T, E = Error | string> =
  | ServerFunctionError<E>
  | ServerFunctionSuccess<T>;

export type ServerFunction<
  TInput extends unknown[],
  TOutput,
  TError = Error | string,
> = (...args: TInput) => Promise<ServerFunctionResult<TOutput, TError>>;
