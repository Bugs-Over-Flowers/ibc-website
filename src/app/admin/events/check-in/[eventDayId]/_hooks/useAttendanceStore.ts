import { create } from "zustand";
import type { GetCheckInForDateSchema } from "@/lib/validation/qr/standard";

type AttendanceStore = {
  /**
   * Scanned data from QR Code
   */
  scannedData: GetCheckInForDateSchema | null;
  /**
   * State for currently selected participants staged for check in
   */
  selectedParticipants: Record<string, boolean>;
  /**
   * a kv store <participantId, remarkString> to track participant remarks
   */
  editedRemarks: Record<string, string>;
  /**
   * Currently selected participant id for remark editing
   */
  selectedRemarkParticipantId: string | null;

  /**
   * A function to refetch the currently scanned data. Passed down from
   * the useCheckIn hook on `CheckInDataDialog`
   */
  refetchScannedDataFunction: (() => Promise<void>) | null;
};

type AttendanceStoreActions = {
  /**
   * Function to refetch scanned data
   * @param refetchFunction The function to refetch the scanned data
   */
  setScannedData: (scannedData: GetCheckInForDateSchema) => void;

  /**
   * Function to open or close the check-in dialog
   * @param isOpen The new state of the dialog
   */
  setCheckInDialogOpen: (isOpen: boolean) => void;

  /**
   * Function to toggle the selection of a participant
   * @param participantId The id of the participant to toggle selection for
   * @param isSelected The new selection state of the participant
   */
  toggleParticipantSelection: (participantId: string) => void;

  /**
   * Function to set the selected participants
   * Uses a similar approach to a setter function in a useState hook for flexibility
   * @param selection The new selection object or a function to update the selection
   */
  setSelectedParticipants: (
    selection:
      | Record<string, boolean>
      | ((old: Record<string, boolean>) => Record<string, boolean>),
  ) => void;

  /**
   * Function to select all selectable participants
   * @param selectableIds The ids of the selectable participants to select
   */
  selectAllSelectableParticipants: (selectableIds: string[]) => void;

  /**
   * Function to clear the selected participants
   */
  clearSelection: () => void;

  /**
   * Function to set the remark for a participant
   * @param participantId The id of the participant to set the remark for
   * @param remark The remark to set for the participant
   */
  setRemark: (participantId: string, remark: string) => void;

  /**
   * Function to reset the check-in state
   */
  resetCheckInState: () => void;

  /**
   * Function to set the refetch function for scanned data
   * @param refetch The refetch function to set
   */
  setRefetchScannedDataFunction: (refetch: () => Promise<void>) => void;

  /**
   * Function to set the selected remark participant id
   * @param participantId The id of the participant to set as the selected remark participant
   */
  setSelectedRemarkParticipantId: (participantId: string | null) => void;

  /**
   * Function to get the editing participant remark
   * @param participantId The id of the participant to get the remark for
   * @returns The remark for the participant or undefined if not found
   */
  getEditingParticipantRemark: (
    participantId?: string | null,
  ) => string | undefined;
};

const useAttendanceStore = create<AttendanceStore & AttendanceStoreActions>(
  (set, get) => ({
    // States
    scannedData: null,
    selectedParticipants: {},
    editedRemarks: {},
    selectedRemarkParticipantId: "",
    refetchScannedDataFunction: null,

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
      set({
        selectedParticipants: {},
        editedRemarks: {},
      });
    },

    setSelectedRemarkParticipantId: (participantId: string | null) => {
      set({ selectedRemarkParticipantId: participantId });
    },

    getEditingParticipantRemark: (participantId?: string | null) => {
      if (!participantId) return "";

      const participant = get().scannedData?.participants.find(
        (p) => p.participantId === participantId,
      );

      if (!participant) return "";

      // Return edited remark if exists, otherwise return original from checkIn
      const editedRemark = get().editedRemarks[participantId];
      if (editedRemark !== undefined) return editedRemark;

      return participant.checkIn?.remarks || "";
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

    setRefetchScannedDataFunction: (refetch: () => Promise<void>) => {
      set({ refetchScannedDataFunction: refetch });
    },
  }),
);

export default useAttendanceStore;
