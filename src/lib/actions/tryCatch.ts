type Result<T> = { data: T; error: null } | { data: null; error: Error };

async function tryCatch<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export default tryCatch;
