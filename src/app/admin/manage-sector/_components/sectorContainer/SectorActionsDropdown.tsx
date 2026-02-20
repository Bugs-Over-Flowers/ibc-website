"use client";

import { Edit, MoreVertical } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteButton from "./DeleteButton";
import EditSectorDialog from "./EditSectorDialog";

interface SectorActionsDropdownProps {
  sectorId: number;
  sectorName: string;
}

export default function SectorActionsDropdown({
  sectorId,
  sectorName,
}: SectorActionsDropdownProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <EditSectorDialog
        currentName={sectorName}
        id={sectorId}
        onOpenChange={setIsEditOpen}
        open={isEditOpen}
      />

      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setIsEditOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DeleteButton id={sectorId} />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
