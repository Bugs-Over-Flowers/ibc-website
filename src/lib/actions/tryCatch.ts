import type { ServerActionResult } from "./types";

async function tryCatch<T>(
  promise: Promise<T>
): Promise<ServerActionResult<T, string>> {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [message, null];
  }
}

export default tryCatch;
