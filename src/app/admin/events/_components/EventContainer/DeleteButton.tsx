"use client";

import { Trash2 } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface DeleteButtonProps {
  handleClick: () => void;
}

export default function DeleteButton({ handleClick }: DeleteButtonProps) {
  return (
    <DropdownMenuItem
      aria-label="Delete event"
      className="flex flex-row items-center text-red-400 text-sm hover:text-red-500"
      onClick={handleClick}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </DropdownMenuItem>
  );
}
