import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
  sponsorName: string;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  sponsorName,
}: ConfirmDeleteDialogProps) {
  console.log("[ConfirmDeleteDialog] State changed:", {
    open,
    isLoading,
    sponsorName,
  });
  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle>Delete Sponsored Registration</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="mt-2 text-base">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{sponsorName}</span>
            's sponsored registration? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-3 pt-4">
          <AlertDialogCancel
            disabled={isLoading}
            onClick={() => console.log("[ConfirmDeleteDialog] Cancel clicked")}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            disabled={isLoading}
            onClick={() => {
              console.log(
                "[ConfirmDeleteDialog] Confirm delete clicked for:",
                sponsorName,
              );
              onConfirm();
            }}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
