"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface SponsoredLinkCardProps {
  uuid: string;
  eventId: string;
}

export function SponsoredLinkCard({ uuid, eventId }: SponsoredLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const registrationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/registration/${eventId}?sr=${uuid}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenLink = () => {
    window.open(registrationUrl, "_blank");
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="flex-1 rounded-lg border border-border bg-muted/50 px-3 py-2">
        <code className="break-all text-muted-foreground text-xs">
          {registrationUrl}
        </code>
      </div>
      <div className="flex gap-1.5">
        <Button
          className="h-9 w-9"
          onClick={handleCopyLink}
          size="icon"
          title="Copy link"
          variant="outline"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button
          className="h-9 w-9"
          onClick={handleOpenLink}
          size="icon"
          title="Open link in new tab"
          variant="outline"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
