import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import tryCatch from "@/lib/server/tryCatch";
import { createClient } from "@/lib/supabase/client";
import { StandardRegistrationSchema } from "@/lib/validation/registration/standard";
import {
  submitRegistration,
  submitRegistrationRPC,
} from "@/server/registration/mutations";
import useRegistrationStore from "./registration.store";
import { useAction } from "./useAction";

export const useSubmitRegistration = () => {
  const registrationData = useRegistrationStore((s) => s.registrationData);
  const eventDetails = useRegistrationStore((s) => s.eventDetails);
  return useAction(
    tryCatch(async () => {
      // validate the registration data;
      const {
        data: parsedRegistrationData,
        error,
        success,
      } = StandardRegistrationSchema.safeParse(registrationData);

      if (!success) {
        console.error(error);
        throw new Error("Invalid registration data");
      }

      // check for eventId
      if (!eventDetails?.eventId) {
        throw new Error("Event ID is missing");
      }

      const { step3 } = parsedRegistrationData;

      // handle uploading the proof of payment
      // If online payment method is selected and payment proof is provided
      if (step3.paymentMethod === "online" && step3.paymentProof) {
        const createUUID = uuidv4();
        const supabase = await createClient();

        const { data, error } = await supabase.storage
          .from("paymentProofs")
          .upload(`reg-${createUUID}`, step3.paymentProof);

        if (error) {
          console.error(error);
          throw new Error(`Failed to upload payment proof: ${error.message}`);
        }

        // handle the mutation logic
        await submitRegistrationRPC({
          eventId: eventDetails?.eventId,
          step1: parsedRegistrationData.step1,
          step2: parsedRegistrationData.step2,
          step3: {
            paymentMethod: "online",
            paymentProofId: `${data.path}`,
          },
          step4: parsedRegistrationData.step4,
        });
      } else {
        // If payment method is not online or payment proof is not provided
        await submitRegistrationRPC({
          eventId: eventDetails?.eventId,
          step1: parsedRegistrationData.step1,
          step2: parsedRegistrationData.step2,
          step3: {
            paymentMethod: "onsite",
          },
          step4: parsedRegistrationData.step4,
        });
      }
    }),
    {
      onSuccess: () => {
        toast.success("Registration successful!");
      },
      onError: (error) => {
        toast.error(`Registration failed: ${error}`);
      },
    },
  );
};
