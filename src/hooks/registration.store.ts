import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StandardRegistrationSchema } from "@/lib/validation/registration/standard";
import type { getRegistrationEventDetails } from "@/server/registration/queries";

export const MAX_STEPS = 4;
export type RegistrationStoreEventDetails = Awaited<
  ReturnType<typeof getRegistrationEventDetails>
>;

interface RegistrationStore {
  step: number;
  eventDetails: RegistrationStoreEventDetails | null;
  registrationData: StandardRegistrationSchema;
  createdRegistrationId?: string;
}

interface RegistrationStoreActions {
  setStep: (step: number) => void;
  setEventDetails: (eventDetails: RegistrationStoreEventDetails | null) => void;
  setRegistrationData: (
    registrationData: Partial<StandardRegistrationSchema> | null,
  ) => void;
  setCreatedRegistrationId: (id: string) => void;
}

const useRegistrationStore = create<
  RegistrationStore & RegistrationStoreActions
>()(
  persist(
    (set) => ({
      step: 1,
      eventDetails: null,
      registrationData: {
        step1: {
          member: "member",
          businessMemberId: "",
          nonMemberName: "",
        },
        step2: {
          principalRegistrant: {
            email: "",
            contactNumber: "",
            firstName: "",
            lastName: "",
          },
          otherRegistrants: [],
        },
        step3: {
          paymentMethod: "onsite",
          paymentProof: undefined,
        },
        step4: {
          termsAndConditions: false,
        },
      },
      setStep: (step: number) => set({ step }),
      setEventDetails: (eventDetails: RegistrationStoreEventDetails | null) =>
        set({ eventDetails }),
      setRegistrationData: (
        registrationData: Partial<StandardRegistrationSchema> | null,
      ) =>
        set((state) => ({
          registrationData:
            registrationData === null
              ? state.registrationData
              : {
                  ...state.registrationData,
                  ...registrationData,
                },
        })),
      setCreatedRegistrationId: (id: string) =>
        set({ createdRegistrationId: id }),
    }),
    {
      name: "registration-storage",
      partialize: (state) => {
        const { registrationData, ...rest } = state;

        // Exclude paymentProof from step3
        const sanitizedRegistrationData = registrationData
          ? {
              ...registrationData,
              step3: registrationData.step3
                ? {
                    paymentMethod: registrationData.step3.paymentMethod,
                  }
                : undefined,
            }
          : null;

        return {
          ...rest,
          registrationData: sanitizedRegistrationData,
        };
      },
    },
  ),
);

export default useRegistrationStore;
