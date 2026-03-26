"use client";

import { AlertTriangle, Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SponsoredLinkCardProps {
  uuid: string;
  eventId: string;
  disabledReason?: "past-event" | "maxed-slots" | null;
}

export function SponsoredLinkCard({
  uuid,
  eventId,
  disabledReason = null,
}: SponsoredLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const isDisabled = disabledReason !== null;

  const registrationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/registration/${eventId}?sr=${uuid}`;

  const handleCopyLink = () => {
    if (isDisabled) {
      return;
    }

    navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenLink = () => {
    if (isDisabled) {
      return;
    }

    window.open(registrationUrl, "_blank");
  };

  const disabledMessage =
    disabledReason === "past-event"
      ? "This link is no longer usable because the event has already ended."
      : "This link is no longer usable because all sponsored guest slots are already filled.";

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div
          className={cn(
            "flex-1 rounded-lg border border-border bg-muted/50 px-3 py-2",
            isDisabled && "border-destructive/30 bg-destructive/5",
          )}
        >
          <code className="break-all text-muted-foreground text-xs">
            {registrationUrl}
          </code>
        </div>
        <div className="flex gap-1.5">
          <Button
            className="h-9 w-9"
            disabled={isDisabled}
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
            disabled={isDisabled}
            onClick={handleOpenLink}
            size="icon"
            title="Open link in new tab"
            variant="outline"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isDisabled ? (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive text-xs sm:text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{disabledMessage}</p>
        </div>
      ) : null}
    </div>
  );
}
