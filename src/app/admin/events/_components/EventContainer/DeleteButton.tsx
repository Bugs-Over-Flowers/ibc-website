"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const deleteAction = tryCatch(deleteEvents);

  const { execute, isPending } = useAction(deleteAction, {
    onSuccess: () => {
      router.refresh();
      toast.success("Event deleted successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error("Failed to delete event", error);
      toast.error(typeof error === "string" ? error : "Failed to delete event");
      setIsDialogOpen(false);
    },
  });

  const handleConfirmDelete = () => {
    if (onAction) onAction();
    execute(id);
  };

  return (
    <>
      <DropdownMenuItem
        aria-label="Delete event"
        className="flex flex-row items-center text-red-400 text-sm hover:text-red-500"
        disabled={isPending}
        onSelect={(e) => {
          e.preventDefault();
          setIsDialogOpen(true);
        }}
      >
        {isPending ? (
          <span className="flex items-center">
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Deleting...
          </span>
        ) : (
          <>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </>
        )}
      </DropdownMenuItem>

      <ConfirmDialog
        cancelText="Cancel"
        confirmText="Delete"
        description="Are you sure you want to delete this event? This action cannot be undone."
        isLoading={isPending}
        onConfirm={handleConfirmDelete}
        onOpenChange={setIsDialogOpen}
        open={isDialogOpen}
        title="Delete Event"
        variant="destructive"
      />
    </>
  );
}
