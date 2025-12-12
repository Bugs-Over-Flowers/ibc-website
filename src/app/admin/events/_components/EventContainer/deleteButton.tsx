"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { deleteEvents } from "@/server/events/actions/deleteEvents";

interface DeleteButtonProps {
  id: string;
  onAction: () => void;
}

export default function DeleteButton({ id, onAction }: DeleteButtonProps) {
  const router = useRouter();
  const deleteAction = tryCatch(deleteEvents);

  const { execute, isPending } = useAction(deleteAction, {
    onSuccess: () => {
      router.refresh();
      toast.success("Event deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete event", error);
      toast.error(typeof error === "string" ? error : "Failed to delete event");
    },
  });

  const handleDelete = async () => {
    if (onAction) onAction();
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    execute(id);
  };

  return (
    <DropdownMenuItem
      aria-label={isPending ? "Deleting event..." : "Delete event"}
      className="flex flex-row items-center text-red-400 text-sm"
      onSelect={(e) => {
        e.preventDefault();
        handleDelete();
      }}
    >
      {isPending ? (
        <span className="flex items-center">
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Deleting...
        </span>
      ) : (
        <>
          <Trash2 className="mr-2 hover:text-blue-400" color="red" size={16} />
          Delete
        </>
      )}
    </DropdownMenuItem>
  );
}
