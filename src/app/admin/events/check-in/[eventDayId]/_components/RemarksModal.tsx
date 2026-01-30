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
  const editedRemarks = useAttendanceStore((state) => state.editedRemarks);

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
      console.log("Remark saved", selectedRemarkParticipantId);
      setSelectedRemarkParticipantId(null);
    },
  });

  const handleSetInitialState = useEffectEvent(
    (selectedRemarkParticipantId: string | null) => {
      if (selectedRemarkParticipantId !== "") {
        console.log("Setting initial state: ");
        console.log("edited remarks: ", editedRemarks);

        console.log(
          "participant remark:",
          getEditingParticipantRemark(selectedRemarkParticipantId),
        );
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
      <DialogContent showCloseButton={false}>
        <form
          onSubmit={(e) => {
            e.stopPropagation();
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <DialogTitle>
            Remarks -{" "}
            {
              scannedData?.participants.find(
                (p) => p.participantId === selectedRemarkParticipantId,
              )?.firstName
            }
          </DialogTitle>

          <form.AppField name="remark">
            {(field) => (
              <div className="space-y-4 py-4">
                <field.TextareaField
                  placeholder="Enter remarks here..."
                  rows={4}
                />
                <div className="text-muted-foreground text-sm">
                  {field.state.value?.length || 0} / 500 characters
                </div>
              </div>
            )}
          </form.AppField>

          <DialogFooter>
            <Button
              onClick={() => setSelectedRemarkParticipantId(null)}
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
