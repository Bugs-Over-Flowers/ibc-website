"use client";

import { ChevronDown, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EventStatus } from "@/lib/events/eventUtils";
import { cn } from "@/lib/utils";
import { type FilterOption, filterLabels } from "../../_utils/searchUtils";

interface EventSearchStatusFilterProps {
  statusFilter: EventStatus | "all";
  onStatusChange: (status: EventStatus | "all") => void;
}

export default function EventSearchStatusFilter({
  statusFilter,
  onStatusChange,
}: EventSearchStatusFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-12 min-w-[160px] items-center justify-between gap-2 rounded-xl border border-border/40 bg-background/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
          statusFilter !== "all" && "border-primary/40 bg-primary/5",
        )}
      >
        <div className="flex items-center gap-2">
          <Filter
            className={cn(
              "h-4 w-4",
              statusFilter !== "all"
                ? "text-primary"
                : "text-muted-foreground/70",
            )}
          />
          <span
            className={
              statusFilter !== "all"
                ? "text-foreground"
                : "text-muted-foreground/70"
            }
          >
            {filterLabels[statusFilter as FilterOption]}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[180px] rounded-xl border-border/50 bg-card p-1 shadow-2xl"
      >
        {(Object.keys(filterLabels) as FilterOption[]).map((option) => (
          <DropdownMenuItem
            className={cn(
              "cursor-pointer rounded-lg transition-colors",
              statusFilter === option
                ? "bg-primary/10 font-medium text-primary"
                : "hover:bg-muted/50",
            )}
            key={option}
            onClick={() => onStatusChange(option as EventStatus | "all")}
          >
            {filterLabels[option]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
