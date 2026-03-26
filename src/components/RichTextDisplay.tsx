"use client";

import { useMemo } from "react";
import sanitizeHtml from "sanitize-html";
import { cn } from "@/lib/utils";

type RichTextDisplayProps = {
  content: string | null;
  className?: string;
};

const SANITIZE_CONFIG: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
  ],
  allowedAttributes: {},
};

function RichTextDisplay({ content, className }: RichTextDisplayProps) {
  const sanitizedContent = useMemo(() => {
    if (!content) return null;
    return sanitizeHtml(content, SANITIZE_CONFIG);
  }, [content]);

  if (!sanitizedContent) {
    return null;
  }

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-p:my-2 prose-p:leading-relaxed",
        "prose-ol:my-2 prose-ul:my-2",
        "prose-li:my-0.5",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}

export default RichTextDisplay;
