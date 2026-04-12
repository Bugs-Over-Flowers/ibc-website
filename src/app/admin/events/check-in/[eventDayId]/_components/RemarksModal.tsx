"use client";

import { revalidateLogic } from "@tanstack/react-form";
import { useEffect, useEffectEvent } from "react";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppForm } from "@/hooks/_formHooks";
import useAttendanceStore from "../_hooks/useAttendanceStore";

export default function RemarksModal() {
  const setSelectedRemarkParticipantId = useAttendanceStore(
    (state) => state.setSelectedRemarkParticipantId,
  );
  const selectedRemarkParticipantId = useAttendanceStore(
    (state) => state.selectedRemarkParticipantId,
  );

  const getEditingParticipantRemark = useAttendanceStore(
    (state) => state.getEditingParticipantRemark,
  );

  const setRemark = useAttendanceStore((state) => state.setRemark);
  const scannedData = useAttendanceStore((state) => state.scannedData);

  const form = useAppForm({
    defaultValues: {
      remark: getEditingParticipantRemark(selectedRemarkParticipantId),
    },
    validationLogic: revalidateLogic({
      mode: "change",
    }),
    validators: {
      onDynamic: z.object({
        remark: z.string().max(500, "Remark cannot exceed 500 characters"),
      }),
    },
    onSubmit: ({ value }) => {
      if (!selectedRemarkParticipantId) return;
      setRemark(selectedRemarkParticipantId, value.remark?.trim() || "");
      setSelectedRemarkParticipantId(null);
    },
  });

  const handleSetInitialState = useEffectEvent(
    (selectedRemarkParticipantId: string | null) => {
      if (selectedRemarkParticipantId !== "") {
        form.reset();
      }
    },
  );

  useEffect(() => {
    if (selectedRemarkParticipantId !== "") {
      handleSetInitialState(selectedRemarkParticipantId);
    }
  }, [selectedRemarkParticipantId]);

  return (
    <Dialog open={!!selectedRemarkParticipantId}>
      <DialogContent className="max-w-sm gap-0 p-0" showCloseButton={false}>
        <div className="border-b px-5 py-4">
          <DialogTitle className="font-medium text-base">
            Remarks -{" "}
            {
              scannedData?.participants.find(
                (p) => p.participantId === selectedRemarkParticipantId,
              )?.firstName
            }
          </DialogTitle>
          <p className="mt-0.5 text-muted-foreground text-xs">
            Add a note for this participant's check-in.
          </p>
        </div>

        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.stopPropagation();
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="px-5 py-4">
            <form.AppField name="remark">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <field.TextareaField
                    placeholder="Enter remarks here..."
                    rows={4}
                  />
                  <p className="text-right text-muted-foreground text-xs">
                    {field.state.value?.length || 0} / 500
                  </p>
                </div>
              )}
            </form.AppField>
          </div>

          <DialogFooter className="justify-end gap-2 border-t px-5 py-3">
            <Button
              onClick={() => setSelectedRemarkParticipantId(null)}
              size="sm"
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <form.AppForm>
              <form.SubmitButton isSubmittingLabel="Saving..." label="Save" />
            </form.AppForm>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
