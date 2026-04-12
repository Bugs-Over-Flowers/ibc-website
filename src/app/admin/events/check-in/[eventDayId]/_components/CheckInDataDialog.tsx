"use client";

import { AlertTriangle, XCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { PaymentProofStatusEnum } from "@/lib/validation/utils";
import useAttendanceStore from "../_hooks/useAttendanceStore";
import { useCheckIn } from "../_hooks/useCheckIn";
import CheckInTable from "./CheckInTable";
import ProofDialog from "./proofResubmit/ProofDialog";

interface CheckInDataDialogProps {
  eventId: string;
  eventTitle: string;
}

export default function CheckInDataDialog({
  eventId,
  eventTitle,
}: CheckInDataDialogProps) {
  const { eventDayId } = useParams<{ eventDayId: string }>();

  // Store selectors
  const setCheckInDialogOpen = useAttendanceStore(
    (s) => s.setCheckInDialogOpen,
  );
  const scannedData = useAttendanceStore((s) => s.scannedData);

  // Data to be sent to the backend
  const selectedParticipants = useAttendanceStore(
    (s) => s.selectedParticipants,
  );
  const editedRemarks = useAttendanceStore((s) => s.editedRemarks);

  // Optimistic action hook
  const { execute, optimistic, isPending } = useCheckIn({ eventId: eventId });

  if (!scannedData) return null;

  const selectedCount =
    Object.values(selectedParticipants).filter(Boolean).length;

  // Detect if there are any edited remarks for checked-in participants
  const hasCheckedInRemarkEdits = () => {
    if (!scannedData || Object.keys(editedRemarks).length === 0) return false;

    return Object.keys(editedRemarks).some((participantId) => {
      const participant = scannedData.participants.find(
        (p) => p.participantId === participantId,
      );
      // Check if participant is already checked in AND remark is different
      if (!participant?.checkIn) return false;

      const originalRemark = participant.checkIn.remarks || "";
      const editedRemark = editedRemarks[participantId] || "";

      return originalRemark !== editedRemark;
    });
  };

  const handleCheckIn = async () => {
    // Collect all participants that need processing:
    // 1. Selected participants (new check-ins)
    // 2. Participants with edited remarks (updates)

    const selectedIds = Object.entries(selectedParticipants)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);

    // Also include participants with edited remarks (even if not selected)
    // Used a Set in order to merge same data
    const participantsToProcess = new Set([
      ...selectedIds,
      ...Object.keys(editedRemarks),
    ]);

    if (participantsToProcess.size === 0) return;

    // Execute optimistic action
    await execute({
      eventDayId,
      participants: Array.from(participantsToProcess).map((id) => ({
        participantId: id,
        remarks: editedRemarks[id] || undefined,
      })),
    });
  };

  // get registrant
  const registrant = scannedData?.participants.find((part) => part.isPrincipal);

  return (
    <Dialog
      disablePointerDismissal
      onOpenChange={setCheckInDialogOpen}
      open={!!scannedData}
    >
      <DialogContent
        className="flex max-h-[90vh] w-[95vw] flex-col gap-0 p-0 sm:max-w-2xl"
        showCloseButton={false}
      >
        <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <DialogTitle className="font-medium text-base">
              Check-in confirmation
            </DialogTitle>
            <p className="mt-0.5 text-muted-foreground text-sm">
              {scannedData.affiliation}
            </p>
            <code className="mt-2 inline-flex rounded border border-border bg-muted px-2 py-0.5 font-mono text-muted-foreground text-xs">
              {scannedData.identifier}
            </code>
          </div>
          {scannedData.paymentProofStatus !== "accepted" && (
            <PaymentStatusNotice
              paymentProofStatus={scannedData.paymentProofStatus}
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <CheckInTable data={scannedData || optimistic} />
        </div>

        <div className="flex flex-col-reverse gap-2 border-t px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            disabled={isPending}
            onClick={() => setCheckInDialogOpen(false)}
            size="sm"
            variant="outline"
          >
            Close
          </Button>
          <div className="flex gap-2">
            {scannedData.paymentMethod === "BPI" &&
              scannedData.proofImage &&
              registrant && (
                <ProofDialog
                  eventTitle={eventTitle}
                  paymentProofStatus={scannedData.paymentProofStatus}
                  registrantEmail={registrant.email}
                  registrantName={`${registrant.firstName} ${registrant.lastName}`}
                  registrationId={scannedData.registrationId}
                />
              )}
            <Button
              className="gap-1.5"
              disabled={
                (selectedCount === 0 && !hasCheckedInRemarkEdits()) || isPending
              }
              onClick={handleCheckIn}
              size="sm"
            >
              {isPending && <Spinner className="size-3.5" />}
              {isPending
                ? "Processing..."
                : selectedCount > 0
                  ? `Check in selected (${selectedCount})`
                  : hasCheckedInRemarkEdits()
                    ? "Update remarks"
                    : "Check in selected (0)"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PaymentStatusNotice({
  paymentProofStatus,
}: {
  paymentProofStatus: (typeof PaymentProofStatusEnum.options)[number];
}) {
  const isPending = paymentProofStatus === "pending";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 font-medium text-xs",
        isPending
          ? "border-[#EF9F27] bg-[#FAEEDA] text-[#633806] dark:border-[#854F0B] dark:bg-[#412402] dark:text-[#FAC775]"
          : "border-[#F09595] bg-[#FCEBEB] text-[#791F1F] dark:border-[#A32D2D] dark:bg-[#501313] dark:text-[#F7C1C1]",
      )}
    >
      {isPending ? (
        <AlertTriangle className="size-3.5 shrink-0" />
      ) : (
        <XCircle className="size-3.5 shrink-0" />
      )}
      {isPending ? "Payment is pending review" : "Payment has been rejected"}
    </div>
  );
}
