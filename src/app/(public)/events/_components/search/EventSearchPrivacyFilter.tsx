"use client";

import { ChevronDown, Globe, Lock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  type PrivacyFilter,
  privacyFilterLabels,
} from "../../_utils/searchUtils";

interface EventSearchPrivacyFilterProps {
  privacyFilter: PrivacyFilter;
  onPrivacyChange: (privacy: PrivacyFilter) => void;
}

export default function EventSearchPrivacyFilter({
  privacyFilter,
  onPrivacyChange,
}: EventSearchPrivacyFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-12 min-w-[160px] items-center justify-between gap-2 rounded-xl border border-border/40 bg-background/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
          privacyFilter !== "all" && "border-primary/40 bg-primary/5",
        )}
      >
        <div className="flex items-center gap-2">
          {privacyFilter === "public" ? (
            <Globe className="h-4 w-4 text-primary" />
          ) : privacyFilter === "private" ? (
            <Lock className="h-4 w-4 text-primary" />
          ) : (
            <Globe
              className={cn(
                "h-4 w-4",
                privacyFilter !== "all"
                  ? "text-primary"
                  : "text-muted-foreground/70",
              )}
            />
          )}
          <span
            className={
              privacyFilter !== "all"
                ? "text-foreground"
                : "text-muted-foreground/70"
            }
          >
            {privacyFilterLabels[privacyFilter]}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[180px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
      >
        {(Object.keys(privacyFilterLabels) as PrivacyFilter[]).map((option) => (
          <DropdownMenuItem
            className={cn(
              "cursor-pointer rounded-lg transition-colors",
              privacyFilter === option
                ? "bg-primary/10 font-medium text-primary"
                : "hover:bg-muted/50",
            )}
            key={option}
            onClick={() => onPrivacyChange(option)}
          >
            <span className="flex items-center gap-2">
              {option === "public" && <Globe className="h-4 w-4" />}
              {option === "private" && <Lock className="h-4 w-4" />}
              {privacyFilterLabels[option]}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
