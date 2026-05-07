export type AsyncResultSuccess<T> = { success: true; data: T; error: null };
export type AsyncResultError<E> = { success: false; error: E; data: null };

export type AsyncResult<T, E = Error | string> =
  | AsyncResultError<E>
  | AsyncResultSuccess<T>;

export type AsyncFunction<
  TInput extends unknown[],
  TOutput,
  TError = Error | string,
> = (...args: TInput) => Promise<AsyncResult<TOutput, TError>>;
