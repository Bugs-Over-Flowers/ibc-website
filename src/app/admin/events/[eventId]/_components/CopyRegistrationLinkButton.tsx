"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type CopyRegistrationLinkButtonProps = {
  eventId: string;
};

export default function CopyRegistrationLinkButton({
  eventId,
}: CopyRegistrationLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleCopyLink = async () => {
    try {
      const registrationLink = `${window.location.origin}/events/${eventId}/register`;
      await navigator.clipboard.writeText(registrationLink);
      setCopied(true);
      toast.success("Registration link copied to clipboard!");
    } catch {
      toast.error("Failed to copy registration link");
    }
  };

  return (
    <Button
      className={"w-full"}
      onClick={handleCopyLink}
      size="sm"
      type="button"
      variant="outline"
    >
      {copied ? (
        <Check className="mr-1.5 h-3.5 w-3.5" />
      ) : (
        <Copy className="mr-1.5 h-3.5 w-3.5" />
      )}
      {copied ? "Copied" : "Registration Link"}
    </Button>
  );
}
