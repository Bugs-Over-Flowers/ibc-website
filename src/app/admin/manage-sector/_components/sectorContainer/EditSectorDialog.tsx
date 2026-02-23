"use client";

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Sector</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <formContext.Provider value={form}>
            <form
              className="space-y-4"
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

              <div className="flex justify-end gap-2">
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
