"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type RichTextDisplayProps = {
  content: string | null;
  className?: string;
};

const ALLOWED_TAGS = new Set([
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
]);

function sanitizeRichText(input: string): string {
  if (typeof window === "undefined") {
    return input;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "text/html");

  const walk = (node: Node) => {
    const children = Array.from(node.childNodes);

    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as HTMLElement;
        const tagName = element.tagName.toLowerCase();

        if (!ALLOWED_TAGS.has(tagName)) {
          const parent = element.parentNode;
          if (parent) {
            while (element.firstChild) {
              parent.insertBefore(element.firstChild, element);
            }
            parent.removeChild(element);
          }
          continue;
        }

        const attrs = Array.from(element.attributes);
        for (const attr of attrs) {
          element.removeAttribute(attr.name);
        }

        walk(element);
      } else if (child.nodeType === Node.COMMENT_NODE) {
        node.removeChild(child);
      } else if (child.nodeType === Node.TEXT_NODE) {
        // keep text nodes
      } else {
        node.removeChild(child);
      }
    }
  };

  walk(doc.body);
  return doc.body.innerHTML;
}

function RichTextDisplay({ content, className }: RichTextDisplayProps) {
  const sanitizedContent = useMemo(() => {
    if (!content) return null;
    return sanitizeRichText(content);
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
