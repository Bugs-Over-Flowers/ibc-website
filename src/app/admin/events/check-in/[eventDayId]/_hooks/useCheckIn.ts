import { toast } from "sonner";
import { useOptimisticAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { checkInParticipants } from "@/server/events/mutations/checkInParticipants";
import { updateCheckInRemarks } from "@/server/events/mutations/updateCheckInRemarks";
import type { CheckInInput, OptimisticCheckIn } from "../_types/scan";
import useAttendanceStore from "./useAttendanceStore";

/**
 * Wrapper function that handles both new check-ins and remark updates
 */
async function handleCheckInAndRemarks(
  input: CheckInInput,
  scannedData: ReturnType<typeof useAttendanceStore.getState>["scannedData"],
) {
  if (!scannedData) {
    throw new Error("No scanned data available");
  }

  // Split participants into new check-ins vs remark updates
  const newCheckIns: typeof input.participants = [];
  const remarkUpdates: typeof input.participants = [];

  for (const participant of input.participants) {
    const existingParticipant = scannedData.participants.find(
      (p) => p.participantId === participant.participantId,
    );

    if (existingParticipant?.checkIn) {
      // Already checked in - this is a remark update
      remarkUpdates.push(participant);
    } else {
      // Not checked in - this is a new check-in
      newCheckIns.push(participant);
    }
  }

  // Execute mutations in parallel
  const promises: Promise<unknown>[] = [];

  if (newCheckIns.length > 0) {
    promises.push(
      checkInParticipants({
        eventDayId: input.eventDayId,
        participants: newCheckIns,
      }),
    );
  }

  if (remarkUpdates.length > 0) {
    promises.push(
      updateCheckInRemarks({
        eventDayId: input.eventDayId,
        participants: remarkUpdates.map((p) => ({
          participantId: p.participantId,
          remarks: p.remarks || null,
        })),
      }),
    );
  }

  const results = await Promise.all(promises);

  // Combine results
  const checkInResult = newCheckIns.length > 0 ? results[0] : null;
  const updateResult =
    remarkUpdates.length > 0 ? results[newCheckIns.length > 0 ? 1 : 0] : null;

  return {
    checkInCount:
      (checkInResult as { checkInCount?: number })?.checkInCount || 0,
    updatedCount:
      (updateResult as { updatedCount?: number })?.updatedCount || 0,
    totalCount:
      ((checkInResult as { checkInCount?: number })?.checkInCount || 0) +
      ((updateResult as { updatedCount?: number })?.updatedCount || 0),
  };
}

export const useCheckIn = () => {
  const scannedData = useAttendanceStore((s) => s.scannedData);
  const clearSelection = useAttendanceStore((s) => s.clearSelection);
  const refetchScannedDataFunction = useAttendanceStore(
    (s) => s.refetchScannedDataFunction,
  );

  return useOptimisticAction(
    tryCatch(async (input: CheckInInput) => {
      return handleCheckInAndRemarks(input, scannedData);
    }),
    scannedData,
    {
      /**
       * Optimistically update both new check-ins and remark edits
       */
      optimisticUpdate: (prev, input: CheckInInput) => {
        if (!prev) return prev;

        const currentTime = new Date().toISOString();
        const updates: Record<string, OptimisticCheckIn> = {};

        // Create optimistic updates for all participants
        for (const p of input.participants) {
          const existingParticipant = prev.participants.find(
            (participant) => participant.participantId === p.participantId,
          );

          if (existingParticipant?.checkIn) {
            // Remark update - preserve original check-in time
            updates[p.participantId] = {
              ...existingParticipant.checkIn,
              remarks: p.remarks || null,
            };
          } else {
            // New check-in - use current time
            updates[p.participantId] = {
              checkInId: `temp-${p.participantId}`,
              checkInTime: currentTime,
              remarks: p.remarks || null,
              eventDayId: input.eventDayId,
            };
          }
        }

        // Merge updates into participants
        return {
          ...prev,
          participants: prev.participants.map((participant) => ({
            ...participant,
            checkIn: updates[participant.participantId] || participant.checkIn,
          })),
        };
      },

      /**
       * On success, confirm optimistic updates and clear selections
       */
      commit: (current) => {
        // Return current optimistic state (will be replaced by refetch)
        return current;
      },

      /**
       * Success callback
       */
      onSuccess: async (data) => {
        if (refetchScannedDataFunction) {
          await refetchScannedDataFunction();
        }

        // Clear selections and edited remarks
        clearSelection();

        // Show success toast with appropriate message
        const checkInCount =
          (data as { checkInCount?: number })?.checkInCount || 0;
        const updatedCount =
          (data as { updatedCount?: number })?.updatedCount || 0;
        const messages: string[] = [];

        if (checkInCount > 0) {
          messages.push(`${checkInCount} checked in`);
        }
        if (updatedCount > 0) {
          messages.push(`${updatedCount} remark(s) updated`);
        }

        toast.success("Success!", {
          description: messages.join(", "),
        });
      },

      /**
       * Error callback
       */
      onError: (error) => {
        console.error("❌ Operation failed:", error);

        toast.error("Operation failed", {
          description: typeof error === "string" ? error : "Please try again",
        });
      },
    },
  );
};
