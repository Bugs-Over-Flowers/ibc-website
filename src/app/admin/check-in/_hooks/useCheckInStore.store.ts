import { create } from "zustand";
import type { RegistrationCheckInListRPC } from "@/lib/validation/checkin/checkin-list";

interface CheckInStore {
  checkInData: RegistrationCheckInListRPC | null;
  remarks: Record<string, string | null>;
  newRemarks: Record<string, string | null>;
  participantIds: string[] | null;
}

type CheckInStoreActions = {
  setCheckInData: (data: RegistrationCheckInListRPC) => void;
  setNewRemarks: (remarks: Record<string, string | null>) => void;
};

const initialState: CheckInStore = {
  checkInData: null,
  remarks: {},
  newRemarks: {},
  participantIds: [],
};

export const useCheckInStore = create<CheckInStore & CheckInStoreActions>()(
  (set) => ({
    ...initialState,

    setCheckInData: (data: RegistrationCheckInListRPC) =>
      set(() => {
        const remarksRecord: Record<string, string> = {};

        data.checkInList.forEach((curr) => {
          if (curr.remarks !== null) {
            remarksRecord[curr.participantId] = curr.remarks;
          }
        });

        return {
          checkInData: data,
          remarks: remarksRecord,
          newRemarks: {},
          participantIds: data.checkInList.map((p) => p.participantId),
        };
      }),
    setNewRemarks: (newRemarks: Record<string, string | null>) =>
      set((prev) => {
        const merged = { ...prev.newRemarks, ...newRemarks };

        // Remove keys where the value is null
        Object.keys(merged).forEach((key) => {
          if (merged[key] === null) {
            delete merged[key];
          }
        });

        return { newRemarks: merged };
      }),
  }),
);
