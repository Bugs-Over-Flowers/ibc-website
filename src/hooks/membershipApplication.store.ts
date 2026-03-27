import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  MembershipApplicationStep1Schema,
  MembershipApplicationStep2Schema,
  MembershipApplicationStep3Schema,
  MembershipApplicationStep4Schema,
} from "@/lib/validation/membership/application";

export const MAX_STEPS = 5;

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
    memberInfo: {
      companyName?: string;
      membershipStatus?: string;
      businessMemberIdentifier?: string;
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
  setMemberValidationAttempt: (count: number) => void;
  setMemberValidationCooldown: (endTime: number | null) => void;
  setMemberValidationStatus: (
    status: "idle" | "valid" | "invalid",
    memberInfo?: {
      companyName?: string;
      membershipStatus?: string;
      businessMemberIdentifier?: string;
      businessMemberId?: string;
    },
    memberIdentifier?: string | null,
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
    lastValidatedMemberIdentifier: null,
    lastValidatedApplicationType: null,
    remainingTime: 0,
    memberInfo: {},
  },
  applicationData: {
    step1: {
      applicationType: "newMember",
      businessMemberIdentifier: "",
    },
    step2: {
      companyName: "",
      companyAddress: "",
      sectorId: "",
      landline: "",
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
          memberValidation: { ...state.memberValidation, remainingTime: time },
        })),

      resetMemberValidation: () =>
        set((state) => ({
          memberValidation: {
            ...state.memberValidation,
            validationStatus: "idle",
            lastValidatedMemberIdentifier: null,
            lastValidatedApplicationType: null,
            memberInfo: {},
          },
        })),
    }),
    {
      name: "membership-application-storage",
      version: 7,
      migrate: (persistedState, version) => {
        if (version < 4) {
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

        if (version < 6) {
          const oldState =
            persistedState as Partial<MembershipApplicationStore>;

          const firstRepresentative =
            oldState?.applicationData?.step3?.representatives?.[0];
          const secondRepresentative =
            oldState?.applicationData?.step3?.representatives?.[1];

          return {
            ...initialState,
            ...oldState,
            applicationData: {
              ...initialState.applicationData,
              ...oldState?.applicationData,
              step3: {
                representatives: [
                  {
                    ...initialState.applicationData.step3.representatives[0],
                    ...firstRepresentative,
                    companyMemberType: "principal",
                  },
                  {
                    ...initialState.applicationData.step3.representatives[1],
                    ...secondRepresentative,
                    companyMemberType: "alternate",
                  },
                ],
              },
            },
          };
        }

        if (version < 7) {
          const oldState =
            persistedState as Partial<MembershipApplicationStore> & {
              memberValidation?: {
                lastValidatedMemberId?: string | null;
              };
            };

          return {
            ...oldState,
            memberValidation: {
              ...oldState?.memberValidation,
              lastValidatedMemberIdentifier:
                oldState?.memberValidation?.lastValidatedMemberIdentifier ??
                oldState?.memberValidation?.lastValidatedMemberId ??
                null,
            },
          } as MembershipApplicationStore;
        }

        return persistedState as MembershipApplicationStore;
      },
      partialize: (state) =>
        ({
          step: state.step,
          isSubmitted: state.isSubmitted,
          memberValidation: state.memberValidation,
          applicationData: {
            step1: state.applicationData.step1,
            step2: {
              companyName: state.applicationData.step2.companyName,
              companyAddress: state.applicationData.step2.companyAddress,
              sectorId: state.applicationData.step2.sectorId,
              landline: state.applicationData.step2.landline,
              mobileNumber: state.applicationData.step2.mobileNumber,
              emailAddress: state.applicationData.step2.emailAddress,
              websiteURL: state.applicationData.step2.websiteURL,
              logoImageURL: state.applicationData.step2.logoImageURL,
              logoImage: undefined,
            },
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
              paymentProof: undefined,
            },
          },
        }) as unknown as MembershipApplicationStore,
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        if (state.applicationData?.step3?.representatives) {
          state.applicationData.step3.representatives =
            state.applicationData.step3.representatives
              .slice(0, 2)
              .map((rep, index) => {
                const serialized = rep as unknown as {
                  birthdate?: string | Date;
                };

                let birthdateValue: Date | undefined;

                if (serialized.birthdate) {
                  birthdateValue =
                    serialized.birthdate instanceof Date
                      ? serialized.birthdate
                      : new Date(serialized.birthdate);
                }

                return {
                  ...rep,
                  companyMemberType: (index === 0
                    ? "principal"
                    : "alternate") as "principal" | "alternate",
                  birthdate: birthdateValue as Date,
                };
              });

          if (state.applicationData.step3.representatives.length < 2) {
            state.applicationData.step3.representatives = [
              {
                ...initialState.applicationData.step3.representatives[0],
                ...state.applicationData.step3.representatives[0],
                companyMemberType: "principal",
              },
              {
                ...initialState.applicationData.step3.representatives[1],
                companyMemberType: "alternate",
              },
            ];
          }
        }

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
