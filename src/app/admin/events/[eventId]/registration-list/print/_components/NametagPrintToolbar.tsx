"use client";

import { CheckSquare, Printer, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NametagPrintToolbarProps {
  allSelected: boolean;
  handleToggleAll: () => void;
  selectedCount: number;
  totalCount: number;
}

export default function NametagPrintToolbar({
  allSelected,
  handleToggleAll,
  selectedCount,
  totalCount,
}: NametagPrintToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
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
        <span className="text-muted-foreground text-sm">
          {selectedCount} / {totalCount} selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        <p className="hidden text-muted-foreground text-sm sm:block">
          Use your browser&apos;s print dialog (Ctrl+P / Cmd+P) or click Print
          Nametags
        </p>
        <Printer className="size-4 text-muted-foreground" />
      </div>
    </div>
  );
}
