"use client";

import { toast } from "sonner";
import { useOptimisticAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { ParticipantCheckInItem } from "@/lib/validation/checkin/checkin-list";
import { checkIn } from "@/server/attendance/actions/checkin";

export const useCheckIn = ({
  checkInList,
}: {
  checkInList?: ParticipantCheckInItem[];
}) => {
  const action = useOptimisticAction(
    tryCatch(checkIn),
    {
      checkInList: checkInList || [],
    },
    {
      optimisticUpdate: (
        prev: {
          checkInList: ParticipantCheckInItem[];
        },
        next,
      ) => {
        if (!prev) {
          return prev;
        }

        const updatedCheckInList = prev.checkInList.map((participant) => ({
          ...participant,
          checkedIn: next.participantIds.includes(participant.participantId)
            ? true
            : participant.checkedIn,
        }));

        return {
          checkInList: updatedCheckInList,
        };
      },
      onSuccess: ({ message }) => {
        toast.message(message);
      },
      onError: (error: string) => {
        toast.error(error);
      },
    },
  );

  return action;
};
