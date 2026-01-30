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
  resetKey: number;
  memberValidation: {
    attemptCount: number;
    cooldownEndTime: number | null;
    validationStatus: "idle" | "valid" | "invalid";
    lastValidatedMemberId: string | null;
    lastValidatedApplicationType: "renewal" | "updating" | null;
    remainingTime: number;
    memberInfo: {
      companyName?: string;
      membershipStatus?: string;
      businessMemberId?: string;
    };
  };
}

interface MembershipApplicationStoreActions {
  setStep: (step: number) => void;
  setApplicationData: (
    applicationData: Partial<MembershipApplicationData>,
  ) => void;
  setIsSubmitted: (isSubmitted: boolean) => void;
  resetStore: () => void;
  // Member validation actions
  setMemberValidationAttempt: (count: number) => void;
  setMemberValidationCooldown: (endTime: number | null) => void;
  setMemberValidationStatus: (
    status: "idle" | "valid" | "invalid",
    memberInfo?: {
      companyName?: string;
      membershipStatus?: string;
      businessMemberId?: string;
    },
    memberId?: string | null,
    applicationType?: "renewal" | "updating" | null,
  ) => void;
  setMemberValidationRemainingTime: (time: number) => void;
  resetMemberValidation: () => void;
}

const initialState: MembershipApplicationStore = {
  step: 1,
  isSubmitted: false,
  resetKey: 0,
  memberValidation: {
    attemptCount: 0,
    cooldownEndTime: null,
    validationStatus: "idle",
    lastValidatedMemberId: null,
    lastValidatedApplicationType: null,
    remainingTime: 0,
    memberInfo: {},
  },
  applicationData: {
    step1: {
      applicationType: "newMember",
      businessMemberId: "",
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
};

const useMembershipApplicationStore = create<
  MembershipApplicationStore & MembershipApplicationStoreActions
>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }),

      setIsSubmitted: (isSubmitted) => set({ isSubmitted }),

      setApplicationData: (data) =>
        set((state) => ({
          applicationData: {
            ...state.applicationData,
            ...data,
          },
        })),

      resetStore: () =>
        set((state) => {
          // Clear the persisted storage to ensure no stale data
          localStorage.removeItem("membership-application-storage");

          return {
            ...initialState,
            // Increment resetKey to force React remount of form components
            resetKey: state.resetKey + 1,
            memberValidation: {
              ...initialState.memberValidation,
              attemptCount: state.memberValidation?.attemptCount ?? 0,
              cooldownEndTime: state.memberValidation?.cooldownEndTime ?? null,
              remainingTime: state.memberValidation?.remainingTime ?? 0,
            },
          };
        }),

      setMemberValidationAttempt: (count) =>
        set((state) => ({
          memberValidation: { ...state.memberValidation, attemptCount: count },
        })),

      setMemberValidationCooldown: (endTime) =>
        set((state) => ({
          memberValidation: {
            ...state.memberValidation,
            cooldownEndTime: endTime,
          },
        })),

      setMemberValidationStatus: (
        status,
        memberInfo = {},
        memberId = null,
        applicationType = null,
      ) =>
        set((state) => ({
          memberValidation: {
            ...state.memberValidation,
            validationStatus: status,
            memberInfo,
            lastValidatedMemberId:
              memberId || state.memberValidation.lastValidatedMemberId,
            lastValidatedApplicationType:
              applicationType ||
              state.memberValidation.lastValidatedApplicationType,
          },
        })),

      setMemberValidationRemainingTime: (time) =>
        set((state) => ({
          memberValidation: { ...state.memberValidation, remainingTime: time },
        })),

      resetMemberValidation: () =>
        set((state) => ({
          memberValidation: {
            ...state.memberValidation,
            validationStatus: "idle",
            lastValidatedMemberId: null,
            lastValidatedApplicationType: null,
            memberInfo: {},
          },
        })),
    }),
    {
      name: "membership-application-storage",
      version: 3,

      // 1. Migrate logic
      migrate: (persistedState, version) => {
        if (version < 3) {
          const oldState =
            persistedState as Partial<MembershipApplicationStore>;
          return {
            ...initialState,
            memberValidation: {
              ...initialState.memberValidation,
              attemptCount: oldState?.memberValidation?.attemptCount ?? 0,
              cooldownEndTime:
                oldState?.memberValidation?.cooldownEndTime ?? null,
            },
          };
        }
        return persistedState as MembershipApplicationStore;
      },

      // 2. Partialize logic - Excludes non-serializable fields (File objects)
      partialize: (state) =>
        ({
          step: state.step,
          isSubmitted: state.isSubmitted,
          // resetKey is intentionally excluded from persistence
          // It should always start at 0 on page load
          memberValidation: state.memberValidation,
          applicationData: {
            step1: state.applicationData.step1,
            // Step2: Explicitly exclude logoImage (File object) - cannot be serialized to localStorage
            step2: {
              companyName: state.applicationData.step2.companyName,
              companyAddress: state.applicationData.step2.companyAddress,
              sectorId: state.applicationData.step2.sectorId,
              landline: state.applicationData.step2.landline,
              faxNumber: state.applicationData.step2.faxNumber,
              mobileNumber: state.applicationData.step2.mobileNumber,
              emailAddress: state.applicationData.step2.emailAddress,
              websiteURL: state.applicationData.step2.websiteURL,
              logoImageURL: state.applicationData.step2.logoImageURL,
              // logoImage: undefined - File object excluded from persistence
              logoImage: undefined,
            },
            step3: {
              representatives: state.applicationData.step3.representatives.map(
                (rep) => ({
                  ...rep,
                  // Serialize Date to string
                  birthdate: rep.birthdate
                    ? new Date(rep.birthdate).toISOString()
                    : undefined,
                }),
              ),
            },
            // Step4: Explicitly exclude paymentProof (File object) - cannot be serialized to localStorage
            step4: {
              applicationMemberType:
                state.applicationData.step4.applicationMemberType,
              paymentMethod: state.applicationData.step4.paymentMethod,
              paymentProofUrl: state.applicationData.step4.paymentProofUrl,
              // paymentProof: undefined - File object excluded from persistence
              paymentProof: undefined,
            },
          },
        }) as unknown as MembershipApplicationStore,

      // 3. Rehydrate logic - Handles the string-to-Date conversion
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        if (state.applicationData?.step3?.representatives) {
          state.applicationData.step3.representatives =
            state.applicationData.step3.representatives.map((rep) => {
              // At runtime, 'rep.birthdate' might be a string string despite the type definition
              const serialized = rep as unknown as {
                birthdate?: string | Date;
              };

              let birthdateVal: Date | undefined;

              if (serialized.birthdate) {
                if (serialized.birthdate instanceof Date) {
                  birthdateVal = serialized.birthdate;
                } else {
                  birthdateVal = new Date(serialized.birthdate);
                }
              }

              return {
                ...rep,
                birthdate: birthdateVal as Date,
              };
            });
        }

        // Ensure File objects are explicitly undefined after rehydration
        // This is defensive programming - partialize already excludes them,
        // but this ensures type safety and prevents any confusion
        if (state.applicationData?.step2) {
          state.applicationData.step2.logoImage = undefined;
        }
        if (state.applicationData?.step4) {
          state.applicationData.step4.paymentProof = undefined;
        }
      },
    },
  ),
);

export default useMembershipApplicationStore;
