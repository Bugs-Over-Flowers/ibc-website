import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import tryCatch from "@/lib/server/tryCatch";
import { createClient } from "@/lib/supabase/client";
import { delay } from "@/lib/utils";
import { StandardRegistrationSchema } from "@/lib/validation/registration/standard";
import { submitRegistrationRPC } from "@/server/registration/actions";
import useRegistrationStore from "./registration.store";
import { useAction } from "./useAction";

export const useSubmitRegistration = () => {
  const registrationData = useRegistrationStore(
    (state) => state.registrationData,
  );
  const eventDetails = useRegistrationStore((state) => state.eventDetails);

  const setCreatedRegistrationId = useRegistrationStore(
    (state) => state.setCreatedRegistrationId,
  );
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

      let returnedRegistrationId = "";

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
        const { registrationId } = await submitRegistrationRPC({
          eventId: eventDetails?.eventId,
          step1: parsedRegistrationData.step1,
          step2: parsedRegistrationData.step2,
          step3: {
            paymentMethod: "online",
            path: `${data.path}.${step3.paymentProof.type.split("/")[1]}`,
          },
          step4: parsedRegistrationData.step4,
        });
        returnedRegistrationId = registrationId;
      } else {
        // If payment method is not online or payment proof is not provided
        const { registrationId } = await submitRegistrationRPC({
          eventId: eventDetails?.eventId,
          step1: parsedRegistrationData.step1,
          step2: parsedRegistrationData.step2,
          step3: {
            paymentMethod: "onsite",
          },
          step4: parsedRegistrationData.step4,
        });
        returnedRegistrationId = registrationId;
      }
      setCreatedRegistrationId(returnedRegistrationId);
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
