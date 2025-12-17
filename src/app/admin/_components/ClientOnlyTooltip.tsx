"use client";

import { Suspense } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function TooltipWrapper() {
  return (
    <Tooltip>
      <TooltipTrigger />
      <SidebarTrigger />
      <TooltipContent side="right">Toggle sidebar</TooltipContent>
    </Tooltip>
  );
}

export function ClientOnlyTooltip() {
  return (
    <Suspense fallback={<SidebarTrigger />}>
      <TooltipWrapper />
    </Suspense>
  );
}
