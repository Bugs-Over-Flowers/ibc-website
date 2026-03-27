export function resolveMemberLogoUrl(
  logoImageURL?: string | null,
): string | null {
  if (!logoImageURL) {
    return null;
  }

  if (
    logoImageURL.startsWith("http://") ||
    logoImageURL.startsWith("https://")
  ) {
    return logoImageURL;
  }

  if (!logoImageURL.startsWith("logo-")) {
    return logoImageURL;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return null;
  }

  const fullURL = `${supabaseUrl}storage/v1/object/public/logoimage/${logoImageURL}`;
  console.log(fullURL);

  return fullURL;
}
