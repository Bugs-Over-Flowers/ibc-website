export type ServerActionSuccess<T> = [null, T];
export type ServerActionError<E> = [E, null];

export type ServerActionResult<T, E = string> =
  | ServerActionError<E>
  | ServerActionSuccess<T>;

export type ServerAction<TInput extends unknown[], TOutput, TError = string> = (
  ...args: TInput
) => Promise<ServerActionResult<TOutput, TError>>;
