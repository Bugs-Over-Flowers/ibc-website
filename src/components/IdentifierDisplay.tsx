"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface IdentifierDisplayProps {
  identifier: string;
  className?: string;
}

export function IdentifierDisplay({
  identifier,
  className,
}: IdentifierDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(identifier);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/30 px-2 py-0.5 font-mono text-xs tracking-tight transition-colors hover:bg-muted/60",
        className,
      )}
      onClick={handleCopy}
      title="Copy identifier"
      type="button"
    >
      <span>{identifier}</span>
      {copied ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground opacity-50" />
      )}
    </button>
  );
}
