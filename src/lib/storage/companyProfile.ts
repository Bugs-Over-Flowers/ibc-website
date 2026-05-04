export const COMPANY_PROFILE_BUCKET = "companyprofile";

export function isStorageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.supabase\.co\/storage\//i.test(url);
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
