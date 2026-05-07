import { create } from "zustand";
import type {
  GetCheckInForDateSchema,
  GetParticipantCheckInForDateSchema,
} from "@/lib/validation/qr/standard";

type ScanType = "registration" | "participant";

type AttendanceStore = {
  /**
   * The current scan type
   */
  scanType: ScanType | null;

  /**
   * Scanned data from QR Code
   */
  scannedData: GetCheckInForDateSchema | null;

  /**
   * State for currently selected participants staged for check in
   */
  participantScanData: GetParticipantCheckInForDateSchema | null;

  /**
   * a kv store <participantId, boolean> to track selected participants for check in
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
};

type AttendanceStoreActions = {
  /**
   * Function to set the scanned data and scan type
   * @param data The scanned data to set
   * @param type The scan type to set
   */
  setScannedData: (
    data: GetCheckInForDateSchema | GetParticipantCheckInForDateSchema,
    type: ScanType,
  ) => void;

  /**
   * Function to set the payment proof status
   * @param status The payment proof status to set
   */
  setPaymentProofStatus: (status: string) => void;

  /**
   * Function to open or close the check-in dialog
   * @param isOpen The new state of the dialog
   */
  setCheckInDialogOpen: (isOpen: boolean) => void;

  /**
   * Function to toggle the selection of a participant
   * @param participantId The id of the participant to toggle selection for
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
    scanType: null,
    scannedData: null,
    participantScanData: null,
    selectedParticipants: {},
    editedRemarks: {},
    selectedRemarkParticipantId: null,

    setScannedData: (
      data: GetCheckInForDateSchema | GetParticipantCheckInForDateSchema,
      type: ScanType,
    ) => {
      if (type === "participant") {
        set({
          scanType: type,
          scannedData: null,
          participantScanData: data as GetParticipantCheckInForDateSchema,
        });
      } else {
        set({
          scanType: type,
          scannedData: data as GetCheckInForDateSchema,
          participantScanData: null,
        });
      }
    },

    setPaymentProofStatus: (status: string) => {
      set((state) => {
        if (state.scanType === "participant" && state.participantScanData) {
          return {
            participantScanData: {
              ...state.participantScanData,
              registration: {
                ...state.participantScanData.registration,
                paymentProofStatus: status as
                  | "pending"
                  | "accepted"
                  | "rejected",
              },
            },
          };
        }
        if (state.scannedData) {
          return {
            scannedData: {
              ...state.scannedData,
              paymentProofStatus: status as "pending" | "accepted" | "rejected",
            },
          };
        }
        return {};
      });
    },

    setCheckInDialogOpen: (isOpen: boolean) => {
      if (!isOpen) {
        get().resetCheckInState();
        set({ scannedData: null, participantScanData: null, scanType: null });
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

      const state = get();

      const registrationParticipant = state.scannedData?.participants.find(
        (p) => p.participantId === participantId,
      );

      if (registrationParticipant) {
        const editedRemark = state.editedRemarks[participantId];
        if (editedRemark !== undefined) return editedRemark;
        return registrationParticipant.checkIn?.remarks || "";
      }

      if (
        state.participantScanData?.participant.participantId === participantId
      ) {
        const editedRemark = state.editedRemarks[participantId];
        if (editedRemark !== undefined) return editedRemark;
        return state.participantScanData.checkIn?.[0]?.remarks || "";
      }

      return "";
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
  }),
);

export default useAttendanceStore;
