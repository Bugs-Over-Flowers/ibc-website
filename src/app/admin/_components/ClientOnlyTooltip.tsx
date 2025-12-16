"use client";

import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ClientOnlyTooltip() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // On server, render just the trigger without tooltip
  if (!isClient) {
    return <SidebarTrigger />;
  }

  // On client, render with tooltip
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarTrigger />
      </TooltipTrigger>
      <TooltipContent side="right">Toggle sidebar</TooltipContent>
    </Tooltip>
  );
}
