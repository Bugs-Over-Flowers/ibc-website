"use client";

import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ICON_OPTIONS, IconOption } from "./icons";

interface LucideIconPickerProps {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
  disabled?: boolean;
}

export function LucideIconPicker({
  selectedIcon,
  onSelect,
  disabled = false,
}: LucideIconPickerProps) {
  const [open, setOpen] = useState(false);

  const selectedOption = useMemo(
    () => ICON_OPTIONS.find((option) => option.name === selectedIcon),
    [selectedIcon],
  );

  const SelectedIcon = selectedOption?.Icon;

  return (
    <div className="space-y-2">
      <p className="font-medium text-sm">Choose Icon</p>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          aria-label="Select icon"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-9 w-36 justify-between overflow-hidden px-3",
          )}
          disabled={disabled}
        >
          <span className="flex min-w-0 items-center gap-2">
            {SelectedIcon ? (
              <SelectedIcon className="h-4 w-4 shrink-0" />
            ) : null}
            <span className="truncate text-sm">
              {selectedOption?.name ?? "Choose an icon"}
            </span>
          </span>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-72 p-3">
          <div className="max-h-64 overflow-y-auto pr-1">
            <div className="grid grid-cols-6 gap-2">
              {ICON_OPTIONS.map(({ name, Icon }) => {
                const isSelected = selectedIcon === name;

                return (
                  <button
                    aria-label={name}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md border p-1 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted",
                    )}
                    disabled={disabled}
                    key={name}
                    onClick={() => {
                      onSelect(name);
                      setOpen(false);
                    }}
                    title={name}
                    type="button"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
