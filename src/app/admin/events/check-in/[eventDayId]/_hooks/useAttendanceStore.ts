import { create } from "zustand";
import type { GetCheckInForDateSchema } from "@/lib/validation/qr/standard";

type AttendanceStore = {
  scannedData: GetCheckInForDateSchema | null;
};

type AttendanceStoreActions = {
  setScannedData: (scannedData: GetCheckInForDateSchema) => void;
  setCheckInDialogOpen: (isOpen: boolean) => void;
};

const useAttendanceStore = create<AttendanceStore & AttendanceStoreActions>(
  (set) => ({
    scannedData: null,
    setScannedData: (scannedData: GetCheckInForDateSchema) => {
      set({ scannedData });
    },
    setCheckInDialogOpen: (isOpen: boolean) => {
      if (!isOpen) {
        set({ scannedData: null });
      }
    },
  }),
);

export default useAttendanceStore;
