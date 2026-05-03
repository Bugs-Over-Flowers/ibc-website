import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DetailRowProps {
  label: string;
  value: ReactNode;
  valueClassName?: string;
  size?: "base" | "sm";
}

export function DetailRow({
  label,
  value,
  valueClassName,
  size = "base",
}: DetailRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </span>
      <span
        className={cn(
          "font-semibold leading-tight",
          size === "sm" ? "text-sm" : "text-base",
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}
