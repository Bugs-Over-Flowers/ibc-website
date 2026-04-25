"use client";

import { ExternalLink } from "lucide-react";
import { FacebookIcon } from "@/components/icons/SocialIcons";

interface FacebookEventLinkProps {
  url?: string | null;
  className?: string;
}

export function FacebookEventLink({ url, className }: FacebookEventLinkProps) {
  if (!url) return null;

  const safeFacebookLink = (() => {
    const rawLink = url.trim();
    if (!rawLink) return null;

    try {
      const parsed = new URL(rawLink);
      const isHttpProtocol =
        parsed.protocol === "https:" || parsed.protocol === "http:";
      const hostname = parsed.hostname.toLowerCase();
      const isFacebookDomain =
        hostname === "fb.me" ||
        hostname === "facebook.com" ||
        hostname.endsWith(".facebook.com");

      if (!isHttpProtocol || !isFacebookDomain) return null;

      return parsed.toString();
    } catch {
      return null;
    }
  })();

  if (!safeFacebookLink) return null;

  return (
    <a
      className={
        className ||
        "flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-foreground transition-colors hover:border-primary/30 hover:bg-accent"
      }
      href={safeFacebookLink}
      rel="noopener noreferrer"
      target="_blank"
    >
      <FacebookIcon className="h-5 w-5 text-[#1877F2]" />
      <span className="flex-1 font-medium">Event Facebook Link</span>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
    </a>
  );
}
