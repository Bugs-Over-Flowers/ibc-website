import { SIGNED_URL_TTL_SECONDS } from "@/lib/constants";
import { COMPANY_PROFILE_BUCKET } from "@/lib/storage/companyProfile";
import { signPaymentProofUrl } from "@/lib/storage/paymentProof";

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

const LOGO_BUCKET = "logoimage";

export async function signLogoUrl(
  supabase: StorageClient,
  path: string | null,
): Promise<string | null> {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const { data, error } = await supabase.storage
    .from(LOGO_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (!error && data?.signedUrl) {
    return data.signedUrl;
  }

  return null;
}

export async function signCompanyProfileUrl(
  supabase: StorageClient,
  path: string | null,
): Promise<string | null> {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const { data, error } = await supabase.storage
    .from(COMPANY_PROFILE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (!error && data?.signedUrl) {
    return data.signedUrl;
  }

  return null;
}

export { signPaymentProofUrl };
