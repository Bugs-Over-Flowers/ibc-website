"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppForm } from "@/hooks/_formHooks";
import tryCatch from "@/lib/server/tryCatch";
import { updateCheckInTime } from "@/server/check-in/mutations/updateCheckInTime";

interface EditCheckInTimeDialogProps {
  checkInId: string;
  currentTime: string;
  eventDayId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const schema = z.object({
  checkInTime: z.iso.datetime({
    offset: true,
    error: "Please select a valid date and time",
  }),
});

export default function EditCheckInTimeDialog({
  checkInId,
  currentTime,
  eventDayId,
  isOpen,
  onOpenChange,
}: EditCheckInTimeDialogProps) {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      checkInTime: currentTime,
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      const { error } = await tryCatch(
        updateCheckInTime({
          checkInId,
          checkInTime: value.checkInTime,
          eventDayId,
        }),
      );

      if (error) {
        console.error("Failed to update check-in time:", error);
        return;
      }

      onOpenChange?.(false);
      router.refresh();
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-medium text-base">
            Edit check-in time
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.AppField name="checkInTime">
            {(field) => <field.FormDateTimePicker label="Check-in time" />}
          </form.AppField>

          <DialogFooter className="mt-5">
            <Button
              onClick={() => onOpenChange(false)}
              size="sm"
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <form.AppForm>
              <form.SubmitButton
                isSubmittingLabel="Updating..."
                label="Update"
              />
            </form.AppForm>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
