"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  type DatePreset,
  type DateRange,
  datePresetLabels,
} from "../../_utils/searchUtils";

interface EventSearchDateFilterProps {
  dateRange: DateRange;
  today: Date;
  isOpen: boolean;
  onDateRangeChange: (range: DateRange) => void;
  onOpenChange: (open: boolean) => void;
  onPresetSelect: (preset: DatePreset) => void;
  selectedPreset: DatePreset;
}

function getDateRangeLabel(dateRange: DateRange) {
  if (dateRange?.from && dateRange?.to) {
    return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  }
  if (dateRange?.from) {
    return `From ${format(dateRange.from, "MMM d, yyyy")}`;
  }
  if (dateRange?.to) {
    return `Until ${format(dateRange.to, "MMM d, yyyy")}`;
  }
  return "Pick a date range";
}

export default function EventSearchDateFilter({
  dateRange,
  today,
  isOpen,
  onDateRangeChange,
  onOpenChange,
  onPresetSelect,
  selectedPreset,
}: EventSearchDateFilterProps) {
  return (
    <Popover onOpenChange={onOpenChange} open={isOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex h-12 flex-1 items-center justify-between gap-3 rounded-xl border border-border/40 bg-background/80 px-4 transition-all hover:border-primary/30 hover:bg-background",
          (dateRange?.from || dateRange?.to) &&
            "border-primary/40 bg-primary/5",
        )}
      >
        <div className="flex items-center gap-3">
          <CalendarIcon
            className={cn(
              "h-4 w-4 shrink-0",
              dateRange?.from || dateRange?.to
                ? "text-primary"
                : "text-muted-foreground/70",
            )}
          />
          <span
            className={cn(
              "truncate",
              !(dateRange?.from || dateRange?.to) && "text-muted-foreground/70",
            )}
          >
            {getDateRangeLabel(dateRange)}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground/70 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto rounded-xl border-border/50 bg-card p-0 shadow-2xl"
        sideOffset={8}
      >
        <div className="flex">
          <div className="flex border-border/30 border-r">
            <Calendar
              className="pointer-events-auto p-3"
              disabled={(date) => date > today}
              initialFocus
              mode="single"
              onSelect={(date) =>
                onDateRangeChange({ ...dateRange, from: date })
              }
              selected={dateRange?.from}
            />
            <Calendar
              className="pointer-events-auto border-border/30 border-l p-3"
              disabled={(date) =>
                date > today ||
                (dateRange?.from ? date < dateRange.from : false)
              }
              mode="single"
              onSelect={(date) => onDateRangeChange({ ...dateRange, to: date })}
              selected={dateRange?.to}
            />
          </div>

          <div className="w-40 border-border/30 border-l p-2">
            <div className="mb-1 px-2 py-1.5 font-medium text-muted-foreground text-xs">
              Quick Select
            </div>
            {(Object.keys(datePresetLabels) as DatePreset[])
              .filter((preset) => preset !== "custom")
              .map((preset) => (
                <button
                  className={cn(
                    "w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                    selectedPreset === preset
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground hover:bg-muted/50",
                  )}
                  key={preset}
                  onClick={() => {
                    onPresetSelect(preset);
                    onOpenChange(false);
                  }}
                  type="button"
                >
                  {datePresetLabels[preset]}
                </button>
              ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
