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
  registrationData: Partial<StandardRegistrationSchema> | null;
}

interface RegistrationStoreActions {
  setStep: (step: number) => void;
  setEventDetails: (eventDetails: RegistrationStoreEventDetails | null) => void;
  setRegistrationData: (
    registrationData: Partial<StandardRegistrationSchema> | null,
  ) => void;
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
        },
        step3: {
          paymentMethod: "online",
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
              ? null
              : {
                  ...state.registrationData,
                  ...registrationData,
                },
        })),
    }),
    {
      name: "registration-storage",
    },
  ),
);

export default useRegistrationStore;
