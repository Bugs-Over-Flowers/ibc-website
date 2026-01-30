"use client";

import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  count?: number;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  title = "Delete Evaluation",
  description = "Are you sure you want to delete this evaluation? This action cannot be undone.",
  count = 1,
}: ConfirmDeleteDialogProps) {
  const pluralText = count !== 1 ? "s" : "";
  const defaultTitle =
    count === 1 ? "Delete Evaluation" : `Delete ${count} Evaluations`;
  const defaultDescription =
    count === 1
      ? "Are you sure you want to delete this evaluation? This action cannot be undone."
      : `Are you sure you want to delete ${count} evaluations? This action cannot be undone.`;

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-destructive/10 p-2">
              <Trash2 className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>{title || defaultTitle}</AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription>
          {description || defaultDescription}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button
            disabled={isLoading}
            onClick={onConfirm}
            variant="destructive"
          >
            {isLoading ? "Deleting..." : `Delete Evaluation${pluralText}`}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
