import { create } from "zustand";
import type { RegistrationCheckInListRPC } from "@/lib/validation/checkin/checkin-list";

interface CheckInStore {
  checkInData: RegistrationCheckInListRPC | null;
  remarks: Record<string, string | null> | null;
  participantIds: string[] | null;
}

type CheckInStoreActions = {
  setCheckInData: (data: RegistrationCheckInListRPC) => void;
  updateRemarks: (remarks: Record<string, string | null>) => void;
  setParticipantIds: (participantIds: string[] | null) => void;
};

const initialState: CheckInStore = {
  checkInData: null,
  remarks: {},
  participantIds: [],
};

export const useCheckInStore = create<CheckInStore & CheckInStoreActions>()(
  (set) => ({
    ...initialState,
    updateRemarks: (remarks: Record<string, string | null>) =>
      set((prev) => ({
        remarks: {
          ...prev.remarks,
          ...remarks,
        },
      })),
    setCheckInData: (data: RegistrationCheckInListRPC) =>
      set(() => ({ checkInData: data })),
    setParticipantIds: (participantIds: string[] | null) =>
      set(() => ({ participantIds })),
  }),
);
