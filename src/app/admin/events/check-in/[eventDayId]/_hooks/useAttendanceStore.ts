import { create } from "zustand";
import type { GetCheckInForDateSchema } from "@/lib/validation/qr/standard";

type AttendanceStore = {
  scannedData: GetCheckInForDateSchema | null;
  selectedParticipants: Record<string, boolean>;
  editedRemarks: Record<string, string>;
  refetchScannedData: (() => Promise<void>) | null;
};

type AttendanceStoreActions = {
  setScannedData: (scannedData: GetCheckInForDateSchema) => void;
  setCheckInDialogOpen: (isOpen: boolean) => void;
  toggleParticipantSelection: (participantId: string) => void;
  setSelectedParticipants: (
    selection:
      | Record<string, boolean>
      | ((old: Record<string, boolean>) => Record<string, boolean>),
  ) => void;
  selectAllSelectableParticipants: (selectableIds: string[]) => void;
  clearSelection: () => void;
  setRemark: (participantId: string, remark: string) => void;
  resetCheckInState: () => void;
  setRefetchScannedData: (refetch: () => Promise<void>) => void;
};

const useAttendanceStore = create<AttendanceStore & AttendanceStoreActions>(
  (set, get) => ({
    // State
    scannedData: null,
    selectedParticipants: {},
    editedRemarks: {},
    refetchScannedData: null,

    // Actions
    setScannedData: (scannedData: GetCheckInForDateSchema) => {
      set({ scannedData });
    },

    setCheckInDialogOpen: (isOpen: boolean) => {
      if (!isOpen) {
        get().resetCheckInState();
        set({ scannedData: null });
      }
    },

    toggleParticipantSelection: (participantId: string) => {
      set((state) => ({
        selectedParticipants: {
          ...state.selectedParticipants,
          [participantId]: !state.selectedParticipants[participantId],
        },
      }));
    },

    setSelectedParticipants: (
      selection:
        | Record<string, boolean>
        | ((old: Record<string, boolean>) => Record<string, boolean>),
    ) => {
      set((state) => ({
        selectedParticipants:
          typeof selection === "function"
            ? selection(state.selectedParticipants)
            : selection,
      }));
    },

    selectAllSelectableParticipants: (selectableIds: string[]) => {
      const current = get().selectedParticipants;
      const allSelected = selectableIds.every((id) => current[id]);

      if (allSelected) {
        // Deselect all
        const newSelection = { ...current };
        for (const id of selectableIds) {
          delete newSelection[id];
        }
        set({ selectedParticipants: newSelection });
      } else {
        // Select all selectable
        const newSelection = { ...current };
        for (const id of selectableIds) {
          newSelection[id] = true;
        }
        set({ selectedParticipants: newSelection });
      }
    },

    clearSelection: () => {
      set({ selectedParticipants: {} });
    },

    setRemark: (participantId: string, remark: string) => {
      set((state) => {
        const newRemarks = { ...state.editedRemarks };
        if (remark.trim() === "") {
          delete newRemarks[participantId];
        } else {
          newRemarks[participantId] = remark;
        }
        return { editedRemarks: newRemarks };
      });
    },

    resetCheckInState: () => {
      set({
        selectedParticipants: {},
        editedRemarks: {},
      });
    },

    setRefetchScannedData: (refetch: () => Promise<void>) => {
      set({ refetchScannedData: refetch });
    },
  }),
);

export default useAttendanceStore;
