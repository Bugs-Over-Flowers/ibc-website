import type { ServerFunctionResult } from "./types";

async function tryCatch<T>(
  promise: Promise<T>,
): Promise<ServerFunctionResult<T, string>> {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [message, null];
  }
}

export default tryCatch;
