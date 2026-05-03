import { ImageUploadFileSchema } from "@/lib/fileUpload";

export const NETWORK_LOGO_BUCKET = "network-logos";
const INVALID_LOGO_HOSTS = new Set(["your-project.supabase.co"]);

export function validateNetworkLogoFile(file: File): string | null {
  const result = ImageUploadFileSchema.safeParse(file);
  if (!result.success) {
    return result.error.issues[0]?.message ?? "Invalid logo file.";
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
