import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  MembershipApplicationStep1Schema,
  MembershipApplicationStep2Schema,
  MembershipApplicationStep3Schema,
  MembershipApplicationStep4Schema,
} from "@/lib/validation/membership/application";

export const MAX_STEPS = 5;
const MEMBERSHIP_APPLICATION_STORAGE_VERSION = 1;

function getManilaDateKey(): string {
  const parts = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function toBirthdate(value: unknown): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return undefined as unknown as Date;
}

function sanitizeApplicationDataForPersist(
  applicationData: MembershipApplicationData,
): MembershipApplicationData {
  return {
    ...applicationData,
    step2: {
      ...applicationData.step2,
      logoImage: undefined,
      companyProfileFile: undefined,
    },
    step4: {
      ...applicationData.step4,
      paymentProof: undefined,
    },
  };
}

function normalizeApplicationDataAfterHydration(
  applicationData: MembershipApplicationData,
): MembershipApplicationData {
  return {
    ...sanitizeApplicationDataForPersist(applicationData),
    step3: {
      ...applicationData.step3,
      representatives: applicationData.step3.representatives.map(
        (representative) => ({
          ...representative,
          birthdate: toBirthdate(representative.birthdate),
        }),
      ) as MembershipApplicationStep3Schema["representatives"],
    },
  };
}

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
    lastValidatedMemberIdentifier: string | null;
    lastValidatedApplicationType: "renewal" | "updating" | null;
    remainingTime: number;
    lastRateLimitResetDate: string | null;
    memberInfo: {
      companyName?: string;
      membershipStatus?: string;
      businessMemberIdentifier?: string;
      businessMemberId?: string;
      applicationMemberType?: "corporate" | "personal";
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
  setMemberValidationAttempt: (count: number) => void;
  setMemberValidationCooldown: (endTime: number | null) => void;
  setMemberValidationStatus: (
    status: "idle" | "valid" | "invalid",
    memberInfo?: {
      companyName?: string;
      membershipStatus?: string;
      businessMemberIdentifier?: string;
      businessMemberId?: string;
      applicationMemberType?: "corporate" | "personal";
    },
    memberIdentifier?: string | null,
    applicationType?: "renewal" | "updating" | null,
  ) => void;
  setMemberValidationRemainingTime: (time: number) => void;
  setMemberValidationRateLimitDate: (date: string | null) => void;
  resetMemberValidationRateLimit: () => void;
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
    lastValidatedMemberIdentifier: null,
    lastValidatedApplicationType: null,
    remainingTime: 0,
    lastRateLimitResetDate: null,
    memberInfo: {},
  },
  applicationData: {
    step1: {
      applicationType: "newMember",
      businessMemberIdentifier: "",
      businessMemberId: "",
    },
    step2: {
      companyName: "",
      companyAddress: "",
      sectorId: "",
      landline: "",
      mobileNumber: "",
      emailAddress: "",
      websiteURL: "",
      companyProfileType: "website",
      companyProfileFile: undefined,
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
          localStorage.removeItem("membership-application-storage");

          return {
            ...initialState,
            resetKey: state.resetKey + 1,
            memberValidation: {
              ...initialState.memberValidation,
              attemptCount: state.memberValidation?.attemptCount ?? 0,
              cooldownEndTime: state.memberValidation?.cooldownEndTime ?? null,
              remainingTime: state.memberValidation?.remainingTime ?? 0,
              lastRateLimitResetDate:
                state.memberValidation?.lastRateLimitResetDate ??
                getManilaDateKey(),
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
        memberIdentifier = null,
        applicationType = null,
      ) =>
        set((state) => ({
          memberValidation: {
            ...state.memberValidation,
            validationStatus: status,
            memberInfo,
            lastValidatedMemberIdentifier:
              memberIdentifier ||
              state.memberValidation.lastValidatedMemberIdentifier,
            lastValidatedApplicationType:
              applicationType ||
              state.memberValidation.lastValidatedApplicationType,
          },
        })),

      setMemberValidationRemainingTime: (time) =>
        set((state) => ({
          memberValidation: {
            ...state.memberValidation,
            remainingTime: time,
          },
        })),

      setMemberValidationRateLimitDate: (date) =>
        set((state) => ({
          memberValidation: {
            ...state.memberValidation,
            lastRateLimitResetDate: date,
          },
        })),

      resetMemberValidationRateLimit: () =>
        set({
          memberValidation: {
            ...initialState.memberValidation,
            lastRateLimitResetDate: getManilaDateKey(),
          },
        }),

      resetMemberValidation: () =>
        set({
          memberValidation: initialState.memberValidation,
        }),
    }),
    {
      name: "membership-application-storage",
      version: MEMBERSHIP_APPLICATION_STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        step: state.step,
        applicationData: sanitizeApplicationDataForPersist(
          state.applicationData,
        ),
        isSubmitted: state.isSubmitted,
        resetKey: state.resetKey,
        memberValidation: state.memberValidation,
      }),
      migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== "object") {
          return persistedState;
        }

        const typedState =
          persistedState as Partial<MembershipApplicationStore>;

        if (typedState.applicationData) {
          typedState.applicationData = normalizeApplicationDataAfterHydration(
            typedState.applicationData as MembershipApplicationData,
          );
        }

        return typedState;
      },
      onRehydrateStorage: () => (state) => {
        if (!state?.applicationData) {
          return;
        }

        state.applicationData = normalizeApplicationDataAfterHydration(
          state.applicationData,
        );
      },
    },
  ),
);

export default useMembershipApplicationStore;
