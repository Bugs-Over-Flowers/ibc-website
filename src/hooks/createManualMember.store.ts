import { create } from "zustand";

export interface CreateManualMemberData {
  step1: {
    companyName: string;
    sectorId: string;
    companyAddress: string;
    websiteURL: string;
    emailAddress: string;
    landline: string;
    mobileNumber: string;
    faxNumber: string;
    logoImageURL: string | File;
    applicationMemberType: "corporate" | "personal";
    membershipStatus: "paid" | "unpaid" | "cancelled";
  };
  step2: {
    firstName: string;
    lastName: string;
    representativeEmailAddress: string;
    companyDesignation: string;
    birthdate: Date;
    sex: "male" | "female";
    nationality: string;
    mailingAddress: string;
    representativeMobileNumber: string;
    representativeLandline: string;
    representativeFaxNumber: string;
    companyMemberType: "principal" | "alternate";
  };
}

interface CreateManualMemberStore {
  step: 1 | 2 | 3;
  memberData: Partial<CreateManualMemberData>;
  isSubmitted: boolean;

  setStep: (step: 1 | 2 | 3) => void;
  setMemberData: (data: Partial<CreateManualMemberData>) => void;
  setStepData: (
    stepNum: 1 | 2,
    data: CreateManualMemberData[keyof CreateManualMemberData],
  ) => void;
  setIsSubmitted: (submitted: boolean) => void;
  resetStore: () => void;
}

const initialData: CreateManualMemberData = {
  step1: {
    companyName: "",
    sectorId: "",
    companyAddress: "",
    websiteURL: "",
    emailAddress: "",
    landline: "",
    mobileNumber: "",
    faxNumber: "",
    logoImageURL: "",
    applicationMemberType: "corporate",
    membershipStatus: "paid",
  },
  step2: {
    firstName: "",
    lastName: "",
    representativeEmailAddress: "",
    companyDesignation: "",
    birthdate: new Date(),
    sex: "male",
    nationality: "",
    mailingAddress: "",
    representativeMobileNumber: "",
    representativeLandline: "",
    representativeFaxNumber: "",
    companyMemberType: "principal",
  },
};

export const useCreateManualMemberStore = create<CreateManualMemberStore>(
  (set) => ({
    step: 1,
    memberData: initialData,
    isSubmitted: false,

    setStep: (step) => set({ step }),

    setMemberData: (data) =>
      set((state) => ({
        memberData: {
          ...state.memberData,
          ...data,
        },
      })),

    setStepData: (stepNum, data) =>
      set((state) => ({
        memberData: {
          ...state.memberData,
          [`step${stepNum}`]: data,
        },
      })),

    setIsSubmitted: (submitted) => set({ isSubmitted: submitted }),

    resetStore: () =>
      set({
        step: 1,
        memberData: initialData,
        isSubmitted: false,
      }),
  }),
);

export default useCreateManualMemberStore;
