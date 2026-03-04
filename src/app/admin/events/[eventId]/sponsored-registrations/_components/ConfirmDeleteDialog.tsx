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
  sponsorName?: string;
  count?: number;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  sponsorName,
  count = 1,
}: ConfirmDeleteDialogProps) {
  const pluralText = count !== 1 ? "s" : "";
  const title =
    count === 1
      ? `Delete Sponsored Registration${count === 1 && sponsorName ? ` by ${sponsorName}` : ""}`
      : `Delete ${count} Sponsored Registrations`;
  const description =
    count === 1
      ? "Are you sure you want to delete this sponsored registration? This action cannot be undone."
      : `Are you sure you want to delete ${count} sponsored registrations? This action cannot be undone.`;

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-destructive/10 p-2">
              <Trash2 className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>{title}</AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription>{description}</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button
            disabled={isLoading}
            onClick={onConfirm}
            variant="destructive"
          >
            {isLoading ? "Deleting..." : `Delete${pluralText}`}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
