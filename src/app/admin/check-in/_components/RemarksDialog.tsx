"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCheckInStore } from "../_hooks/useCheckInStore.store";
import { useSetRemarks } from "../_hooks/useSetRemarks";

interface RemarksDialogProps {
  remarks: string | null;
  participantName: string;
  participantId: string;
}

export default function RemarksDialog({
  remarks,
  participantName,
  participantId,
}: RemarksDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useSetRemarks({ remarks, participantId, setOpen });

  const remarkValue = useCheckInStore(
    (state) => state.newRemarks?.[participantId],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(e);
  };
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {remarkValue || remarks ? "Edit Remarks" : "Add Remarks"}
          </Button>
        }
      />

      <DialogContent>
        <form className="w-full space-y-3" onSubmit={handleSubmit}>
          <DialogTitle>{participantName}</DialogTitle>
          <form.AppField name="remarks">
            {(field) => <field.TextareaField label="Remarks" />}
          </form.AppField>
          <form.AppForm>
            <form.SubmitButton
              className="w-full"
              isSubmittingLabel="Saving..."
              label="Save"
            />
          </form.AppForm>
        </form>
      </DialogContent>
    </Dialog>
  );
}
