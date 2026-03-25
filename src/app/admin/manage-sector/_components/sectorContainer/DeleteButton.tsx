"use client";

import { Trash } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { deleteSector } from "@/server/sectors/mutations";

interface DeleteButtonProps {
  id: number;
}

export default function DeleteButton({ id }: DeleteButtonProps) {
  const { execute, isPending } = useAction(tryCatch(deleteSector), {
    onSuccess: () => {
      toast.success("Sector deleted successfully");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    execute({ id });
  };

  return (
    <DropdownMenuItem
      className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
      disabled={isPending}
      onClick={handleDelete}
    >
      <Trash className="mr-2 h-4 w-4" />
      <span>{isPending ? "Deleting..." : "Delete"}</span>
    </DropdownMenuItem>
  );
}
