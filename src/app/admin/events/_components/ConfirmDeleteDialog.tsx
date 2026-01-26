"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { deleteEvents } from "@/server/events/actions/deleteEvents";

interface ConfirmDialogProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfirmDeleteDialog({
  eventId,
  open,
  onOpenChange,
}: ConfirmDialogProps) {
  const router = useRouter();

  const deleteAction = tryCatch(deleteEvents);

  const { execute, isPending } = useAction(deleteAction, {
    onSuccess: () => {
      router.refresh();
      toast.success("Event deleted successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Failed to delete event", error);
      toast.error(typeof error === "string" ? error : "Failed to delete event");
      onOpenChange(false);
    },
  });
  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are You Sure?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this event? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => {
              execute(eventId);
            }}
            variant={"destructive"}
          >
            {isPending ? "Processing..." : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
