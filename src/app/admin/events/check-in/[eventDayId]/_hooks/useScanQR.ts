"use client";

import { toast } from "sonner";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { getCheckInForDate } from "@/server/attendance/mutations/getCheckInForDate";
import useAttendanceStore from "./useAttendanceStore";

export const useScanQR = () => {
  const setScannedData = useAttendanceStore((state) => state.setScannedData);
  return useAction(
    tryCatch((qrCodeData: string, eventDayId: string) =>
      getCheckInForDate(qrCodeData, eventDayId),
    ),
    {
      onSuccess: ({ checkInData }) => {
        setScannedData(checkInData);
      },
      onError: (message) => {
        toast.error(message);
      },
      persist: true,
    },
  );
};
