"use client";

import DOMPurify from "isomorphic-dompurify";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface RichTextDisplayProps {
  content: string | null;
  className?: string;
}

function RichTextDisplay({ content, className }: RichTextDisplayProps) {
  const sanitizedContent = useMemo(() => {
    if (!content) return null;
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
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
      ALLOWED_ATTR: [],
    });
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
