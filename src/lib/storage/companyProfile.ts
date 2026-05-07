export const COMPANY_PROFILE_BUCKET = "companyprofile";

export function isStorageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (/\.supabase\.co\/storage\//i.test(url)) return true;
  if (/\.(pdf|jpe?g|png|gif|docx?|xlsx?|pptx?)$/i.test(url.trim())) return true;
  return false;
}

export function normalizeWebsiteUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function resolveCompanyProfileUrl(url?: string | null): string | null {
  if (!url) return null;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;

  return new URL(
    `storage/v1/object/public/${COMPANY_PROFILE_BUCKET}/${url}`,
    supabaseUrl,
  ).toString();
}
