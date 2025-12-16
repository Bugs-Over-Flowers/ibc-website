"use client";

import { toast } from "sonner";
import { useOptimisticAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { checkIn } from "@/server/attendance/mutations/checkin";
import type { getRegistrationIdentifierDetails } from "@/server/attendance/mutations/getRegistrationIdentifierDetails";

type RegistrationIdentifierResult = Awaited<
  ReturnType<typeof getRegistrationIdentifierDetails>
>;

type CheckInState = RegistrationIdentifierResult | null;

export const useCheckIn = (currentState: CheckInState) => {
  const action = useOptimisticAction(tryCatch(checkIn), currentState, {
    optimisticUpdate: (
      prev: CheckInState,
      participantIds: string[],
      eventDayId: string,
    ) => {
      if (!prev) {
        return prev;
      }

      const updatedParticipantList = prev.data.participantList.map(
        (participant) => ({
          ...participant,
          checkIn: participantIds.includes(participant.participantId)
            ? true
            : participant.checkIn,
        }),
      );

      const allCheckedIn = updatedParticipantList.every((p) => p.checkIn);

      // Create optimistic check-in entries matching the full type
      const newCheckIns = participantIds.map((participantId) => ({
        checkInId: `optimistic-${participantId}-${Date.now()}`,
        date: new Date().toLocaleString(),
        eventDayId,
        participantId,
      }));

      return {
        message: allCheckedIn
          ? `All participants under this registration are checked in for ${prev.data.eventDetails.eventTitle}. Affiliation: ${prev.data.registrationDetails.affiliation}`
          : prev.message,
        data: {
          ...prev.data,
          participantList: updatedParticipantList,
          checkInList: [...prev.data.checkInList, ...newCheckIns],
        },
      };
    },
    onSuccess: ({ message }) => {
      toast.message(message);
    },
    onError: (error: string) => {
      toast.error(error);
    },
  });

  return action;
};
