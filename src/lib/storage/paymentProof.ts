import { SIGNED_URL_TTL_SECONDS } from "@/lib/constants";

export const PAYMENT_PROOFS_BUCKET = "paymentproofs";

type StorageError = { message: string } | null;

type SignedUrlResponse = {
  data: { signedUrl: string } | null;
  error: StorageError;
};

type StorageClient = {
  storage: {
    from: (bucket: string) => {
      createSignedUrl: (
        path: string,
        expiresIn: number,
      ) => Promise<SignedUrlResponse>;
    };
  };
};

export function extractStorageObjectPath(path: string, bucket: string): string {
  const trimmedPath = path.trim();

  if (trimmedPath === "") {
    throw new Error("Storage object path is empty");
  }

  if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
    const url = new URL(trimmedPath);
    const marker = `/${bucket}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex < 0) {
      throw new Error(`Invalid storage URL for bucket '${bucket}'`);
    }

    const extractedPath = url.pathname.slice(markerIndex + marker.length);

    if (!extractedPath) {
      throw new Error("Invalid storage URL path");
    }

    return decodeURIComponent(extractedPath);
  }

  return trimmedPath;
}

export function normalizeLegacyStoragePath(path: string): string {
  return path.replace(/\.[A-Za-z0-9]+$/, "");
}

export async function signPaymentProofUrl(
  supabase: StorageClient,
  rawPath: string | null,
): Promise<string | null> {
  if (!rawPath) {
    return null;
  }

  const extractedPath = extractStorageObjectPath(
    rawPath,
    PAYMENT_PROOFS_BUCKET,
  );
  const candidatePaths = Array.from(
    new Set([extractedPath, normalizeLegacyStoragePath(extractedPath)]),
  );

  for (const candidatePath of candidatePaths) {
    const { data, error } = await supabase.storage
      .from(PAYMENT_PROOFS_BUCKET)
      .createSignedUrl(candidatePath, SIGNED_URL_TTL_SECONDS);

    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }
  }

  return null;
}
