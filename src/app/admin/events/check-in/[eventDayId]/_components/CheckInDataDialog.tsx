"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import useAttendanceStore from "../_hooks/useAttendanceStore";
import { useCheckIn } from "../_hooks/useCheckIn";
import CheckInTable from "./CheckInTable";

interface CheckInDataDialogProps {
  eventId: string;
}

export default function CheckInDataDialog({ eventId }: CheckInDataDialogProps) {
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

    console.log("🚀 Check-in/Update started:", {
      participantIds: Array.from(participantsToProcess),
      eventDayId,
      remarks: editedRemarks,
    });

    // Execute optimistic action
    await execute({
      eventDayId,
      participants: Array.from(participantsToProcess).map((id) => ({
        participantId: id,
        remarks: editedRemarks[id] || undefined,
      })),
    });
  };

  return (
    <Dialog onOpenChange={setCheckInDialogOpen} open={scannedData !== null}>
      <DialogContent
        className={"w-full md:min-w-2xl md:max-w-2xl"}
        showCloseButton={false}
      >
        <DialogTitle>
          <pre>{scannedData.identifier}</pre>
        </DialogTitle>
        <h4>{scannedData.affiliation}</h4>

        <div className="w-full overflow-auto">
          {/* Pass optimistic data to table, but prioritize fetched Data */}
          <CheckInTable data={scannedData || optimistic} />
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            disabled={isPending}
            onClick={() => setCheckInDialogOpen(false)}
            variant="outline"
          >
            Close
          </Button>
          <div>
            <Button
              disabled={
                (selectedCount === 0 && !hasCheckedInRemarkEdits) || isPending
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
