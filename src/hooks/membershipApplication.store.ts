import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  MembershipApplicationStep1Schema,
  MembershipApplicationStep2Schema,
  MembershipApplicationStep3Schema,
  MembershipApplicationStep4Schema,
} from "@/lib/validation/membership/application";

export const MAX_STEPS = 4;

export interface MembershipApplicationData {
  step1: MembershipApplicationStep1Schema;
  step2: MembershipApplicationStep2Schema;
  step3: MembershipApplicationStep3Schema;
  step4: MembershipApplicationStep4Schema;
}

interface MembershipApplicationStore {
  step: number;
  applicationData: MembershipApplicationData;
  isSubmitted: boolean;
}

interface MembershipApplicationStoreActions {
  setStep: (step: number) => void;
  setApplicationData: (
    applicationData: Partial<MembershipApplicationData> | null,
  ) => void;
  setIsSubmitted: (isSubmitted: boolean) => void;
  resetStore: () => void;
}

const getInitialState = (): MembershipApplicationStore => ({
  step: 1,
  isSubmitted: false,
  applicationData: {
    step1: {
      applicationType: "newMember",
    },
    step2: {
      companyName: "",
      companyAddress: "",
      sectorId: "",
      landline: "",
      faxNumber: "",
      mobileNumber: "",
      emailAddress: "",
      websiteURL: "",
      logoImageURL: "",
      logoImage: undefined,
    },
    step3: {
      representatives: [
        {
          companyMemberType: "principal",
          firstName: "",
          lastName: "",
          mailingAddress: "",
          sex: "male",
          nationality: "",
          birthdate: undefined as unknown as Date,
          companyDesignation: "",
          landline: "",
          faxNumber: "",
          mobileNumber: "",
          emailAddress: "",
        },
        {
          companyMemberType: "alternate",
          firstName: "",
          lastName: "",
          mailingAddress: "",
          sex: "male",
          nationality: "",
          birthdate: undefined as unknown as Date,
          companyDesignation: "",
          landline: "",
          faxNumber: "",
          mobileNumber: "",
          emailAddress: "",
        },
      ],
    },
    step4: {
      applicationMemberType: "corporate",
      paymentMethod: "ONSITE",
      paymentProofUrl: "",
      paymentProof: undefined,
    },
  },
});

const useMembershipApplicationStore = create<
  MembershipApplicationStore & MembershipApplicationStoreActions
>()(
  persist(
    (set) => ({
      ...getInitialState(),
      setStep: (step: number) => set({ step }),
      setIsSubmitted: (isSubmitted: boolean) => set({ isSubmitted }),
      setApplicationData: (
        applicationData: Partial<MembershipApplicationData> | null,
      ) =>
        set((state) => ({
          applicationData:
            applicationData === null
              ? state.applicationData
              : {
                  ...state.applicationData,
                  ...applicationData,
                },
        })),
      resetStore: () => set(getInitialState()),
    }),
    {
      name: "membership-application-storage",
      version: 3,
      migrate: (_persistedState, version) => {
        if (version < 3) {
          const initialState = getInitialState();

          return {
            step: initialState.step,
            applicationData: {
              step1: initialState.applicationData.step1,
              step2: initialState.applicationData.step2,
              step3: {
                representatives:
                  initialState.applicationData.step3.representatives.map(
                    (rep) => ({
                      ...rep,
                      birthdate: undefined,
                    }),
                  ),
              },
              step4: {
                applicationMemberType:
                  initialState.applicationData.step4.applicationMemberType,
                paymentMethod: initialState.applicationData.step4.paymentMethod,
                paymentProofUrl:
                  initialState.applicationData.step4.paymentProofUrl,
              },
            },
          };
        }
        return _persistedState;
      },
      partialize: (state) => ({
        step: state.step,
        applicationData: {
          step1: state.applicationData.step1,
          step2: state.applicationData.step2,
          step3: {
            representatives: state.applicationData.step3.representatives.map(
              (rep) => ({
                ...rep,
                birthdate: rep.birthdate
                  ? new Date(rep.birthdate).toISOString()
                  : undefined,
              }),
            ),
          },
          step4: {
            applicationMemberType:
              state.applicationData.step4.applicationMemberType,
            paymentMethod: state.applicationData.step4.paymentMethod,
            paymentProofUrl: state.applicationData.step4.paymentProofUrl,
          },
        },
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.applicationData?.step3?.representatives) {
          state.applicationData.step3.representatives =
            state.applicationData.step3.representatives.map((rep) => {
              const serialized = rep as unknown as { birthdate?: string };
              return {
                ...rep,
                birthdate: (serialized.birthdate
                  ? new Date(serialized.birthdate)
                  : undefined) as Date,
              };
            });
        }
      },
    },
  ),
);

export default useMembershipApplicationStore;
