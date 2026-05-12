"use client";

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

type DeleteSelectedCardsDialogProps = {
  hasSelectedCards: boolean;
  open: boolean;
  onConfirmDelete: () => void;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
};

export function DeleteSelectedCardsDialog({
  hasSelectedCards,
  open,
  onConfirmDelete,
  onOpenChange,
  selectedCount,
}: DeleteSelectedCardsDialogProps) {
  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete selected cards?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove {selectedCount} selected card
            {selectedCount === 1 ? "" : "s"} from the editor. Click Save Changes
            to persist this deletion.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={!hasSelectedCards}
            onClick={() => {
              onConfirmDelete();
            }}
          >
            Confirm Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
