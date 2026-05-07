import sanitizeHtml from "sanitize-html";

export function stripRichText(html: string | null | undefined): string {
  if (!html) return "";

  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .trim()
    .replace(/\s+/g, " ");
}
