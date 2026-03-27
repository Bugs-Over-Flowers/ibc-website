"use client";

import { Edit, Eye, MoreVertical, Trash } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteSectorDialog from "./DeleteSectorDialog";
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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <EditSectorDialog
        currentName={sectorName}
        id={sectorId}
        onOpenChange={setIsEditOpen}
        open={isEditOpen}
      />
      <DeleteSectorDialog
        id={sectorId}
        onOpenChange={setIsDeleteOpen}
        open={isDeleteOpen}
        sectorName={sectorName}
      />

      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Link
              className="flex w-full cursor-pointer items-center"
              href={`/admin/manage-sector/${sectorId}/members` as Route}
            >
              <Eye className="mr-2 h-4 w-4" />
              <span>View Members</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setIsEditOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsDeleteOpen(true);
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
