"use client";

import type useQuickRegistration from "@/app/admin/events/check-in/[eventDayId]/_hooks/useQuickRegistration";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

interface QuickOnsiteRegistrationActionsProps {
  quickForm: ReturnType<typeof useQuickRegistration>;
}

export default function QuickOnsiteRegistrationActions({
  quickForm,
}: QuickOnsiteRegistrationActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <DialogClose
        render={
          <Button
            className="w-full sm:w-auto"
            size="sm"
            type="button"
            variant="outline"
          />
        }
      >
        Cancel
      </DialogClose>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <quickForm.Subscribe
          selector={(state) => [state.isSubmitting, state.isValid]}
        >
          {([isSubmitting, isValid]) => (
            <>
              <Button
                className="w-full sm:w-auto"
                disabled={isSubmitting || !isValid}
                onClick={() => quickForm.handleSubmit({ keepOpen: true })}
                size="sm"
                type="button"
                variant="outline"
              >
                {isSubmitting ? "Processing..." : "Check In Another"}
              </Button>
              <Button
                className="w-full sm:w-auto"
                disabled={isSubmitting || !isValid}
                size="sm"
                type="submit"
              >
                {isSubmitting ? "Processing..." : "Register & Check In"}
              </Button>
            </>
          )}
        </quickForm.Subscribe>
      </div>
    </div>
  );
}
