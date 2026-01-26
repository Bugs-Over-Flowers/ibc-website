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
  // Member validation rate limiting
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
      businessMemberId?: string; // The actual UUID from database
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

const getInitialState = (): MembershipApplicationStore => ({
  step: 1,
  isSubmitted: false,
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
      resetStore: () =>
        set((state) => {
          const initialState = getInitialState();
          return {
            ...initialState,
            // Preserve rate limiting data to prevent bypass
            memberValidation: {
              ...initialState.memberValidation,
              attemptCount: state.memberValidation.attemptCount,
              cooldownEndTime: state.memberValidation.cooldownEndTime,
              remainingTime: state.memberValidation.remainingTime,
            },
          };
        }),
      // Member validation actions
      setMemberValidationAttempt: (count: number) =>
        set((state) => ({
          memberValidation: {
            ...state.memberValidation,
            attemptCount: count,
          },
        })),
      setMemberValidationCooldown: (endTime: number | null) =>
        set((state) => ({
          memberValidation: {
            ...state.memberValidation,
            cooldownEndTime: endTime,
          },
        })),
      setMemberValidationStatus: (
        status: "idle" | "valid" | "invalid",
        memberInfo = {},
        memberId: string | null = null,
        applicationType: "renewal" | "updating" | null = null,
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
      setMemberValidationRemainingTime: (time: number) =>
        set((state) => ({
          memberValidation: {
            ...state.memberValidation,
            remainingTime: time,
          },
        })),
      resetMemberValidation: () =>
        set((state) => ({
          memberValidation: {
            ...state.memberValidation,
            validationStatus: "idle",
            lastValidatedMemberId: null,
            lastValidatedApplicationType: null,
            memberInfo: {},
            // Keep attemptCount and cooldownEndTime to prevent bypass
          },
        })),
    }),
    {
      name: "membership-application-storage",
      version: 5,
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<MembershipApplicationStore>;
        const initialState = getInitialState();

        // For any version upgrade, preserve what we can
        if (version < 5) {
          return {
            step: state?.step ?? initialState.step,
            isSubmitted: false,
            memberValidation: {
              attemptCount: state?.memberValidation?.attemptCount ?? 0,
              cooldownEndTime: state?.memberValidation?.cooldownEndTime ?? null,
              validationStatus:
                state?.memberValidation?.validationStatus ?? "idle",
              lastValidatedMemberId:
                state?.memberValidation?.lastValidatedMemberId ?? null,
              lastValidatedApplicationType:
                state?.memberValidation?.lastValidatedApplicationType ?? null,
              remainingTime: state?.memberValidation?.remainingTime ?? 0,
              memberInfo: state?.memberValidation?.memberInfo ?? {},
            },
            applicationData: {
              step1:
                state?.applicationData?.step1 ??
                initialState.applicationData.step1,
              step2:
                state?.applicationData?.step2 ??
                initialState.applicationData.step2,
              step3: {
                representatives:
                  state?.applicationData?.step3?.representatives ??
                  initialState.applicationData.step3.representatives.map(
                    (rep) => ({
                      ...rep,
                      birthdate: undefined,
                    }),
                  ),
              },
              step4: {
                applicationMemberType:
                  state?.applicationData?.step4?.applicationMemberType ??
                  initialState.applicationData.step4.applicationMemberType,
                paymentMethod:
                  state?.applicationData?.step4?.paymentMethod ??
                  initialState.applicationData.step4.paymentMethod,
                paymentProofUrl:
                  state?.applicationData?.step4?.paymentProofUrl ??
                  initialState.applicationData.step4.paymentProofUrl,
              },
            },
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        step: state.step,
        isSubmitted: state.isSubmitted,
        memberValidation: {
          attemptCount: state.memberValidation.attemptCount,
          cooldownEndTime: state.memberValidation.cooldownEndTime,
          validationStatus: state.memberValidation.validationStatus,
          lastValidatedMemberId: state.memberValidation.lastValidatedMemberId,
          lastValidatedApplicationType:
            state.memberValidation.lastValidatedApplicationType,
          remainingTime: state.memberValidation.remainingTime,
          memberInfo: state.memberValidation.memberInfo,
        },
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
