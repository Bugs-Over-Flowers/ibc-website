import { create } from "zustand";

export interface CreateNetworkData {
  step1: {
    organization: string;
    about: string;
    locationType: string;
    representativeName: string;
    representativePosition: string;
    logoUrl: string | File | null;
  };
}

interface CreateNetworkStore {
  step: 1 | 2;
  networkData: Partial<CreateNetworkData>;
  isSubmitted: boolean;

  setStep: (step: 1 | 2) => void;
  setNetworkData: (data: Partial<CreateNetworkData>) => void;
  setStepData: (stepNum: 1, data: CreateNetworkData["step1"]) => void;
  setIsSubmitted: (submitted: boolean) => void;
  resetStore: () => void;
}

const initialData: CreateNetworkData = {
  step1: {
    organization: "",
    about: "",
    locationType: "",
    representativeName: "",
    representativePosition: "",
    logoUrl: null,
  },
};

export const useCreateNetworkStore = create<CreateNetworkStore>((set) => ({
  step: 1,
  networkData: initialData,
  isSubmitted: false,

  setStep: (step) => set({ step }),

  setNetworkData: (data) =>
    set((state) => ({
      networkData: {
        ...state.networkData,
        ...data,
      },
    })),

  setStepData: (stepNum, data) =>
    set((state) => ({
      networkData: {
        ...state.networkData,
        [`step${stepNum}`]: data,
      },
    })),

  setIsSubmitted: (submitted) => set({ isSubmitted: submitted }),

  resetStore: () =>
    set({
      step: 1,
      networkData: initialData,
      isSubmitted: false,
    }),
}));

export default useCreateNetworkStore;
