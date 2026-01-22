import { toast } from "sonner";
import { useOptimisticAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { checkInParticipants } from "@/server/events/mutations/checkInParticipants";
import type { CheckInInput, OptimisticCheckIn } from "../_types/scan";
import useAttendanceStore from "./useAttendanceStore";

export const useCheckIn = () => {
  const scannedData = useAttendanceStore((s) => s.scannedData);

  const clearSelection = useAttendanceStore((s) => s.clearSelection);

  const refetchScannedDataFunction = useAttendanceStore(
    (s) => s.refetchScannedDataFunction,
  );

  return useOptimisticAction(tryCatch(checkInParticipants), scannedData, {
    /**
     * Optimistically add check-ins before server confirms
     */
    optimisticUpdate: (prev, input: CheckInInput) => {
      if (!prev) return prev;

      const currentTime = new Date().toISOString();
      const optimisticCheckIns: Record<string, OptimisticCheckIn> = {};

      // Create optimistic check-in records
      for (const p of input.participants) {
        optimisticCheckIns[p.participantId] = {
          checkInId: `temp-${p.participantId}`,
          checkInTime: currentTime,
          remarks: p.remarks || null,
          eventDayId: input.eventDayId,
        };
      }

      // Merge optimistic check-ins into participants
      return {
        ...prev,
        participants: prev.participants.map((participant) => ({
          ...participant,
          checkIn:
            optimisticCheckIns[participant.participantId] ||
            participant.checkIn,
        })),
      };
    },

    /**
     * On success, confirm optimistic updates and clear selections
     */
    commit: (current) => {
      // Clear selections and edited remarks for checked-in participants

      // Return current optimistic state (will be replaced by refetch)
      return current;
    },

    /**
     * Auto-rollback on error (restores previous state)
     */
    // rollback not needed - automatic rollback to prev snapshot

    /**
     * Success callback
     */
    onSuccess: async () => {
      if (refetchScannedDataFunction) {
        const { error } = await tryCatch(refetchScannedDataFunction());

        if (error) {
          console.error("Failed to refetch scanned data:", error);
        }
      }

      // Refetch the scanned data to get the updated state from server
      clearSelection();
    },

    /**
     * Error callback
     */
    onError: (error) => {
      console.error("❌ Check-in failed:", error);

      toast.error("Check-in failed", {
        description: error || "Please try again",
      });
    },
  });
};
