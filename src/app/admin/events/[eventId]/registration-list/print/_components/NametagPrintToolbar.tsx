"use client";

import { CheckSquare, Printer, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <Button
          className="gap-2"
          onClick={handleToggleAll}
          type="button"
          variant="outline"
        >
          {allSelected ? (
            <>
              <Square className="size-4" />
              Deselect All
            </>
          ) : (
            <>
              <CheckSquare className="size-4" />
              Select All
            </>
          )}
        </Button>
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
