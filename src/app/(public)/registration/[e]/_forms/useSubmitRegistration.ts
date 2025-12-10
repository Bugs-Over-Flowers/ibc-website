import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import useRegistrationStore from "@/hooks/registration.store";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { createClient } from "@/lib/supabase/client";
import { StandardRegistrationSchema } from "@/lib/validation/registration/standard";
import { submitRegistrationRPC } from "@/server/registration/actions";

export const useSubmitRegistration = () => {
  const eventDetails = useRegistrationStore((state) => state.eventDetails);

  const setCreatedRegistrationId = useRegistrationStore(
    (state) => state.setCreatedRegistrationId,
  );
  return useAction(
    tryCatch(async (fullRegistrationData: StandardRegistrationSchema) => {
      // validate the registration data;
      const {
        data: parsedRegistrationData,
        error,
        success,
      } = StandardRegistrationSchema.safeParse(fullRegistrationData);

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
      return returnedRegistrationId;
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
