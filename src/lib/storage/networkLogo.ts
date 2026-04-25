export const NETWORK_LOGO_BUCKET = "network-logos";
const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;
const INVALID_LOGO_HOSTS = new Set(["your-project.supabase.co"]);
const ALLOWED_LOGO_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
]);

export function validateNetworkLogoFile(file: File): string | null {
  if (!ALLOWED_LOGO_MIME_TYPES.has(file.type)) {
    return "Invalid logo type. Use PNG or JPG/JPEG.";
  }

  if (file.size > MAX_LOGO_SIZE_BYTES) {
    return "Logo is too large. Maximum size is 5MB.";
  }

  return null;
}

export function resolveNetworkLogoUrl(logoUrl?: string | null): string | null {
  if (!logoUrl) {
    return null;
  }

  if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
    try {
      const parsedUrl = new URL(logoUrl);

      if (INVALID_LOGO_HOSTS.has(parsedUrl.hostname)) {
        return null;
      }
    } catch {
      return null;
    }

    return logoUrl;
  }

  if (!logoUrl.startsWith("network-")) {
    return logoUrl;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return null;
  }

  return new URL(
    `storage/v1/object/public/${NETWORK_LOGO_BUCKET}/${logoUrl}`,
    supabaseUrl,
  ).toString();
}
