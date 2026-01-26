import { create } from "zustand";

interface SelectedApplicationsState {
  selectedApplicationIds: Set<string>;
  toggleSelection: (applicationId: string) => void;
  selectAll: (applicationIds: string[]) => void;
  clearSelection: () => void;
  isSelected: (applicationId: string) => boolean;
  removeApplication: (applicationId: string) => void;
}

export const useSelectedApplicationsStore = create<SelectedApplicationsState>(
  (set, get) => ({
    selectedApplicationIds: new Set(),

    toggleSelection: (applicationId: string) => {
      set((state) => {
        const newSet = new Set(state.selectedApplicationIds);
        if (newSet.has(applicationId)) {
          newSet.delete(applicationId);
        } else {
          newSet.add(applicationId);
        }
        return { selectedApplicationIds: newSet };
      });
    },

    selectAll: (applicationIds: string[]) => {
      set({ selectedApplicationIds: new Set(applicationIds) });
    },

    clearSelection: () => {
      set({ selectedApplicationIds: new Set() });
    },

    isSelected: (applicationId: string) => {
      return get().selectedApplicationIds.has(applicationId);
    },

    removeApplication: (applicationId: string) => {
      set((state) => {
        const newSet = new Set(state.selectedApplicationIds);
        newSet.delete(applicationId);
        return { selectedApplicationIds: newSet };
      });
    },
  }),
);
