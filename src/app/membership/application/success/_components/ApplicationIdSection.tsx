"use client";

import { Copy, IdCard } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ApplicationIdSectionProps {
  identifier: string;
}

export function ApplicationIdSection({
  identifier,
}: ApplicationIdSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyIdentifier = async () => {
    if (!identifier) return;

    try {
      await navigator.clipboard.writeText(identifier);
      setCopied(true);
      toast.success("Application ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="rounded-2xl bg-linear-to-br from-primary/10 via-primary/[0.07] to-transparent p-6 ring-1 ring-primary/25 sm:p-8">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-primary/15 p-1.5">
          <IdCard className="h-4 w-4 text-primary" />
        </span>
        <h2 className="font-bold text-primary text-sm uppercase tracking-widest">
          Your Application ID
        </h2>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-12 flex-1 items-center rounded-lg border border-primary/20 bg-background px-4 font-mono font-semibold text-foreground text-sm uppercase">
          {identifier}
        </div>
        <Button
          className={`h-12 whitespace-nowrap rounded-lg px-4 font-semibold transition-all ${
            copied ? "border-primary bg-primary/10 text-primary" : ""
          }`}
          onClick={handleCopyIdentifier}
          size="lg"
          variant="outline"
        >
          <Copy className={`mr-2 h-4 w-4 ${copied ? "text-primary" : ""}`} />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <p className="mt-3 text-muted-foreground text-sm">
        Use this ID to check your status anytime.
      </p>
    </div>
  );
}
