"use client";

import { toast } from "sonner";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { getCheckInForDate } from "@/server/attendance/mutations/getCheckInForDate";
import useAttendanceStore from "./useAttendanceStore";

export const useScanQR = ({ eventId }: { eventId: string }) => {
  const setScannedData = useAttendanceStore((state) => state.setScannedData);
  return useAction(
    tryCatch((qrCodeData: string, eventDayId: string) =>
      getCheckInForDate(qrCodeData, eventDayId),
    ),
    {
      onSuccess: ({ checkInData }) => {
        if (eventId !== checkInData.event.eventId) {
          toast.error("This QR code does not belong to this event.");
          return;
        }
        setScannedData(checkInData);
      },
      onError: (message) => {
        toast.error(message);
      },
      persist: true,
    },
  );
};
