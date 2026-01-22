"use client";

import { useParams } from "next/navigation";
import { toast } from "sonner";
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

export default function CheckInDataDialog() {
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
  const { execute, optimistic, isPending } = useCheckIn();

  if (!scannedData) return null;

  const selectedCount =
    Object.values(selectedParticipants).filter(Boolean).length;

  const handleCheckIn = async () => {
    // Get selected participant IDs
    const selectedIds = Object.entries(selectedParticipants)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);

    // If no participants are selected, return early
    if (selectedIds.length === 0) return;

    console.log("🚀 Check-in started:", {
      participantIds: selectedIds,
      eventDayId,
      remarks: editedRemarks,
    });

    // Show loading toast
    const loadingToastId = toast.loading(
      `Checking in ${selectedIds.length} participant(s)...`,
    );

    // Execute optimistic action
    const { error } = await execute({
      eventDayId,
      participants: selectedIds.map((id) => ({
        participantId: id,
        remarks: editedRemarks[id] || undefined,
      })),
    });

    if (error) {
      toast.error(`Failed to check in participants: ${error}`);
    } else {
      toast.dismiss(loadingToastId);
      toast.success(`Checked in ${selectedIds.length} participant(s)`);
    }
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
              disabled={selectedCount === 0 || isPending}
              onClick={handleCheckIn}
            >
              {isPending ? (
                <>
                  <Spinner className="mr-2" />
                  Checking In...
                </>
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
