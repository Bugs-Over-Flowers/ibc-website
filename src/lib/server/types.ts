export type ServerFunctionSuccess<T> = { success: true; data: T };
export type ServerFunctionError<E> = { success: false; error: E };

export type ServerFunctionResult<T, E = Error | string> =
  | ServerFunctionError<E>
  | ServerFunctionSuccess<T>;

export type ServerFunction<
  TInput extends unknown[],
  TOutput,
  TError = Error | string,
> = (...args: TInput) => Promise<ServerFunctionResult<TOutput, TError>>;
