
type ServerActionSuccess<T> = { success: true; data: T };
type ServerActionError = { success: false; error: string };
export type ServerActionResult<T> = ServerActionSuccess<T> | ServerActionError;

export type ServerAction<TInput extends unknown[], TOutput> = (
  ...args: TInput
) => Promise<ServerActionResult<TOutput>>;
