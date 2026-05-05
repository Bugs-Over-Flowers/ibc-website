export const PERSONAL_IMAGE_BUCKET = "personalimage";

type StorageClient = {
  storage: {
    from: (bucket: string) => {
      remove: (
        paths: string[],
      ) => Promise<{ error: { message: string } | null } | { error?: null }>;
    };
  };
};

export function normalizePersonalImageObjectPath(path: string): string {
  const normalized = decodeURIComponent(path)
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/{2,}/g, "/");

  if (normalized.length === 0) {
    throw new Error("Storage object path is empty");
  }

  return normalized;
}

export function extractPersonalImageObjectPath(rawPath: string): string {
  const trimmedPath = rawPath.trim();

  if (trimmedPath.length === 0) {
    throw new Error("Storage object path is empty");
  }

  if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
    const url = new URL(trimmedPath);
    const marker = `/${PERSONAL_IMAGE_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex < 0) {
      throw new Error("Invalid storage URL for personalimage bucket");
    }

    const objectPath = url.pathname.slice(markerIndex + marker.length);
    return normalizePersonalImageObjectPath(objectPath);
  }

  return normalizePersonalImageObjectPath(trimmedPath);
}

export async function removePersonalImages(
  supabase: StorageClient,
  rawPaths: Array<string | null | undefined>,
) {
  const paths = Array.from(
    new Set(
      rawPaths
        .filter(Boolean)
        .map((p) => {
          try {
            return extractPersonalImageObjectPath(p as string);
          } catch (_e) {
            // Skip invalid URLs or non-storage values
            return null;
          }
        })
        .filter(Boolean) as string[],
    ),
  );

  if (paths.length === 0) {
    return { error: null };
  }

  try {
    const result = await supabase.storage
      .from(PERSONAL_IMAGE_BUCKET)
      .remove(paths);
    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: { message } };
  }
}
