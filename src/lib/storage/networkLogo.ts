import { createClient } from "@/lib/supabase/client";

const NETWORK_LOGO_BUCKET = "network-logos";
const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;
const INVALID_LOGO_HOSTS = new Set(["your-project.supabase.co"]);
const ALLOWED_LOGO_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

export function validateNetworkLogoFile(file: File): string | null {
  if (!ALLOWED_LOGO_MIME_TYPES.has(file.type)) {
    return "Invalid logo type. Use PNG, JPG, WEBP, or SVG.";
  }

  if (file.size > MAX_LOGO_SIZE_BYTES) {
    return "Logo is too large. Maximum size is 5MB.";
  }

  return null;
}

export async function uploadNetworkLogo(file: File): Promise<string> {
  const validationError = validateNetworkLogoFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const filePath = `network-${crypto.randomUUID()}.${extension}`;
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from(NETWORK_LOGO_BUCKET)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload logo: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(NETWORK_LOGO_BUCKET).getPublicUrl(filePath);

  return publicUrl;
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
