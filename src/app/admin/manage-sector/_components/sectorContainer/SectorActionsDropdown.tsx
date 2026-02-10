"use client";

import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteButton from "./DeleteButton";
import EditButton from "./EditButton";

interface SectorActionsDropdownProps {
  sectorId: number;
}

export default function SectorActionsDropdown({
  sectorId,
}: SectorActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
        <MoreVertical className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <EditButton id={sectorId} />
        <DropdownMenuSeparator />
        <DeleteButton id={sectorId} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
