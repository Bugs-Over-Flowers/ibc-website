export type ServerFunctionSuccess<T> = readonly [error: null, data: T];
export type ServerFunctionError<E> = readonly [error: E, data: null];

export type ServerFunctionResult<T, E = string> =
  | ServerFunctionError<E>
  | ServerFunctionSuccess<T>;

export type ServerFunction<
  TInput extends unknown[],
  TOutput,
  TError = string,
> = (...args: TInput) => Promise<ServerFunctionResult<TOutput, TError>>;
