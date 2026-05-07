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
import { deleteCheckInRemark } from "@/server/check-in/mutations/deleteCheckInRemark";

interface DeleteRemarkDialogProps {
  checkInId: string;
  participantName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export default function DeleteRemarkDialog({
  checkInId,
  participantName,
  open,
  onOpenChange,
  onDeleted,
}: DeleteRemarkDialogProps) {
  const router = useRouter();

  const { execute: doDelete, isPending } = useAction(
    tryCatch(deleteCheckInRemark),
    {
      onSuccess: () => {
        router.refresh();
        onOpenChange(false);
        onDeleted();
        toast.success("Remark deleted successfully");
      },
      onError: (error) => {
        toast.error(
          typeof error === "string" ? error : "Failed to delete remark",
        );
      },
    },
  );

  return (
    <AlertDialog
      onOpenChange={(value) => {
        if (!value && isPending) return;
        onOpenChange(value);
      }}
      open={open}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are You Sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the remark for {participantName}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => {
              doDelete({ checkInId });
            }}
            variant="destructive"
          >
            {isPending ? "Removing..." : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
