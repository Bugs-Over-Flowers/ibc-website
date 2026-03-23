import sanitizeHtml from "sanitize-html";

export interface SanitizeEmailHtmlOptions {
  /**
   * Extend or override allowed tags for specific templates.
   */
  allowedTags?: string[];
  /**
   * Extend or override allowed attributes for specific templates.
   * Example: { a: ["href", "target", "rel"], img: ["src", "alt"] }
   */
  allowedAttributes?: sanitizeHtml.IOptions["allowedAttributes"];
}

/**
 * Shared baseline config for sanitizing HTML intended for email rendering.
 * Keep this conservative to reduce XSS risk and broken email markup.
 */
const defaultEmailSanitizeConfig: sanitizeHtml.IOptions = {
  // A conservative allowlist for common email-safe markup.
  allowedTags: [
    "a",
    "b",
    "br",
    "blockquote",
    "code",
    "div",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "li",
    "ol",
    "p",
    "pre",
    "span",
    "strong",
    "table",
    "tbody",
    "td",
    "th",
    "thead",
    "tr",
    "u",
    "ul",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
    "*": ["class", "style"],
    td: ["colspan", "rowspan", "align", "valign"],
    th: ["colspan", "rowspan", "align", "valign"],
  },
  // Avoid javascript: and other unsafe schemes
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: {
    a: ["http", "https", "mailto", "tel"],
  },
  // Disallow protocol-relative URLs
  allowProtocolRelative: false,
  // Drop disallowed tags entirely with their content for safety
  disallowedTagsMode: "discard",
};

/**
 * Sanitizes HTML for server-side email rendering.
 * Use this in resend templates/mutations instead of DOMPurify.
 */
export function sanitizeEmailHtml(
  dirtyHtml: string,
  options: SanitizeEmailHtmlOptions = {},
): string {
  const mergedConfig: sanitizeHtml.IOptions = {
    ...defaultEmailSanitizeConfig,
    ...(options.allowedTags
      ? { allowedTags: options.allowedTags }
      : defaultEmailSanitizeConfig.allowedTags
        ? { allowedTags: defaultEmailSanitizeConfig.allowedTags }
        : {}),
    ...(options.allowedAttributes
      ? { allowedAttributes: options.allowedAttributes }
      : defaultEmailSanitizeConfig.allowedAttributes
        ? { allowedAttributes: defaultEmailSanitizeConfig.allowedAttributes }
        : {}),
  };

  return sanitizeHtml(dirtyHtml, mergedConfig);
}

export default sanitizeEmailHtml;
