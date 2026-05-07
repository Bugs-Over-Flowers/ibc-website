"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface NametagPrintToolbarProps {
  allSelected: boolean;
  handleToggleAll: () => void;
  handlePrint: () => void;
  noneSelected: boolean;
  selectedCount: number;
  totalCount: number;
}

export default function NametagPrintToolbar({
  allSelected,
  handleToggleAll,
  handlePrint,
  noneSelected,
  selectedCount,
  totalCount,
}: NametagPrintToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={allSelected}
          id="select-all"
          onCheckedChange={handleToggleAll}
        />
        <Label htmlFor="select-all">Select All</Label>
        <span className="text-muted-foreground text-sm tabular-nums">
          {selectedCount} / {totalCount} selected
        </span>
      </div>

      <Button
        className="gap-2"
        disabled={noneSelected}
        onClick={handlePrint}
        size="sm"
      >
        <Printer className="size-4" />
        Print Nametags
      </Button>
    </div>
  );
}
