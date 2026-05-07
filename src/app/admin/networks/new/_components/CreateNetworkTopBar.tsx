"use client";

import type { Route } from "next";
import BackButton from "@/app/admin/_components/BackButton";

type CreateNetworkTopBarProps = {
  crumbLabel?: string;
};

export default function CreateNetworkTopBar({
  crumbLabel = "Create New Network",
}: CreateNetworkTopBarProps) {
  return (
    <div className="sticky top-0 z-30 border-border bg-transparent">
      <div className="items-left mx-auto flex max-w-7xl justify-between px-2">
        <div className="flex items-center gap-3">
          <BackButton
            href={"/admin/networks" as Route}
            label="Back to Networks"
          />
          <span className="text-muted-foreground/40 text-sm">/</span>
          <span className="font-semibold text-foreground text-sm">
            {crumbLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
