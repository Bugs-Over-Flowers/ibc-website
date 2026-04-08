"use client";

import { CircleAlert } from "lucide-react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Item, ItemMedia } from "@/components/ui/item";
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
        className="flex max-h-[90vh] w-[95vw] flex-col sm:max-w-3xl"
        showCloseButton={false}
      >
        <div className="flex w-full flex-col justify-between gap-10 border-b pb-3 sm:flex-row">
          <div className="flex flex-col gap-1">
            <DialogTitle className="flex flex-col gap-2 font-bold text-xl tracking-tight">
              Check-in Confirmation
            </DialogTitle>
            <div className="font-medium text-muted-foreground text-sm">
              {scannedData.affiliation}
            </div>
            <Badge className="mt-2 font-mono text-xs" variant="outline">
              {scannedData.identifier}
            </Badge>
          </div>
          {scannedData.paymentProofStatus !== "accepted" && (
            <DataDialogProofStatusMessage
              paymentProofStatus={scannedData.paymentProofStatus}
            />
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-1 py-2">
          {/* Pass optimistic data to table, but prioritize fetched Data */}
          <CheckInTable data={scannedData || optimistic} />
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-between">
          <Button
            className="w-full sm:w-auto"
            disabled={isPending}
            onClick={() => setCheckInDialogOpen(false)}
            variant="outline"
          >
            Close
          </Button>
          <div className="w-full space-x-2 sm:w-auto">
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
              className="w-full sm:w-auto"
              disabled={
                (selectedCount === 0 && !hasCheckedInRemarkEdits()) || isPending
              }
              onClick={handleCheckIn}
            >
              {isPending ? (
                <>
                  <Spinner className="mr-2" />
                  Processing...
                </>
              ) : selectedCount > 0 ? (
                <>Check In Selected ({selectedCount})</>
              ) : hasCheckedInRemarkEdits() ? (
                <>Update Remarks</>
              ) : (
                <>Check In Selected ({selectedCount})</>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DataDialogProofStatusMessageProps {
  paymentProofStatus: (typeof PaymentProofStatusEnum.options)[number];
}

function DataDialogProofStatusMessage({
  paymentProofStatus,
}: DataDialogProofStatusMessageProps) {
  const colorClass =
    paymentProofStatus === "pending"
      ? "text-yellow-600 border-yellow-300"
      : paymentProofStatus === "rejected" && "text-red-500 border-red-300";
  return (
    <Item className={cn("sm:w-max", colorClass)} variant={"outline"}>
      <ItemMedia>
        <CircleAlert />
      </ItemMedia>
      <div>
        {paymentProofStatus === "pending"
          ? "This payment is still pending review."
          : paymentProofStatus === "rejected" &&
            "This payment has been rejected."}
      </div>
    </Item>
  );
}
