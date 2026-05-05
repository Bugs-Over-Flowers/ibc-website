"use client";

import { toast } from "sonner";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import {
  ParticipantIdentifier,
  RegistrationIdentifier,
} from "@/lib/validation/utils";
import { getCheckInForDate } from "@/server/attendance/mutations/getCheckInForDate";
import { getParticipantCheckInData } from "@/server/attendance/mutations/getParticipantCheckInData";
import useAttendanceStore from "./useAttendanceStore";

export const useScanQR = ({ eventId }: { eventId: string }) => {
  const setScannedData = useAttendanceStore((state) => state.setScannedData);
  return useAction(
    tryCatch(async (qrCodeData: string, eventDayId: string) => {
      const regMatch = RegistrationIdentifier.safeParse(qrCodeData);
      const parMatch = ParticipantIdentifier.safeParse(qrCodeData);

      if (regMatch.success) {
        return {
          type: "registration" as const,
          data: await getCheckInForDate(qrCodeData, eventDayId),
        };
      }

      if (parMatch.success) {
        return {
          type: "participant" as const,
          data: await getParticipantCheckInData(qrCodeData, eventDayId),
        };
      }

      throw new Error("Invalid QR code format.");
    }),
    {
      onSuccess: (result) => {
        const { type, data } = result;
        const scanDataEventId = data.checkInData.event.eventId;

        if (scanDataEventId !== eventId) {
          toast.error("This QR code does not belong to this event.");
          return;
        }

        setScannedData(data.checkInData as never, type);
      },
      onError: (message) => {
        console.error(message);
        toast.error(message);
      },
      persist: true,
    },
  );
};
