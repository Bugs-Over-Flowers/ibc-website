"use client";

import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formContext } from "@/hooks/_formHooks";
import { useEditSectorForm } from "../../_hooks/useEditSectorForm";

interface EditSectorDialogProps {
  id: number;
  currentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditSectorDialog({
  id,
  currentName,
  open,
  onOpenChange,
}: EditSectorDialogProps) {
  const { form } = useEditSectorForm({
    id,
    currentName,
    onSuccess: () => onOpenChange(false),
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <DialogTitle className="text-xl">Edit Sector</DialogTitle>
          </div>
          <p className="text-muted-foreground text-sm">
            Update the sector name and details.
          </p>
        </DialogHeader>

        <div className="py-6">
          <formContext.Provider value={form}>
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              <form.AppField name="sectorName">
                {(field) => (
                  <field.TextField
                    label="Sector Name"
                    placeholder="Enter sector name"
                  />
                )}
              </form.AppField>

              <div className="flex flex-col-reverse gap-3 border-border/50 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  onClick={() => onOpenChange(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <form.AppForm>
                  <form.SubmitButton
                    isSubmittingLabel="Saving..."
                    label="Save Changes"
                  />
                </form.AppForm>
              </div>
            </form>
          </formContext.Provider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
