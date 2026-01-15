import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import useRegistrationStore from "@/hooks/registration.store";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { createClient } from "@/lib/supabase/client";
import { StandardRegistrationSchema } from "@/lib/validation/registration/standard";
import { submitRegistrationRPC } from "@/server/registration/actions/submitRegistrationRPC";

/**
 * Hook for submitting event registration data to the server.
 *
 * This hook handles the complete registration submission flow:
 * 1. Validates all registration data against StandardRegistrationSchema
 * 2. Uploads payment proof to Supabase storage (if online payment selected)
 * 3. Submits registration data to database via RPC call
 * 4. Returns registration ID and identifier for email confirmation
 *
 * @returns useAction hook with execute function and loading state
 *
 * @example
 * const { execute, isPending } = useSubmitRegistration();
 * const result = await execute(fullRegistrationData);
 * if (result.data) {
 *   const { returnedRegistrationId, returnedRegistrationIdentifier } = result.data;
 * }
 */
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
      let returnedRegistrationIdentifier = "";

      /**
       * PAYMENT PROOF UPLOAD FLOW
       *
       * For online payments:
       * 1. Generate unique UUID to prevent filename collisions
       * 2. Upload File object to Supabase 'paymentProofs' bucket
       * 3. Construct final path by appending file extension from MIME type
       *    Example: "reg-abc123" + ".jpg" (extracted from "image/jpg")
       *
       * Why separate upload and submission:
       * - File upload must succeed before database transaction
       * - Server action cannot receive File objects, only paths
       * - Storage and database are separate concerns
       */
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

        // Submit registration with file path (not File object)
        // Path format: "reg-{uuid}.{extension}" (e.g., "reg-abc123.jpg")
        const {
          rpcResults: { registrationId },
          identifier,
        } = await submitRegistrationRPC({
          eventId: eventDetails?.eventId,
          step1: parsedRegistrationData.step1,
          step2: parsedRegistrationData.step2,
          step3: {
            paymentMethod: "online",
            // Extract file extension from MIME type (e.g., "image/jpeg" → "jpeg")
            path: `${data.path}.${step3.paymentProof.type.split("/")[1]}`,
          },
          step4: parsedRegistrationData.step4,
        });
        returnedRegistrationId = registrationId;
        returnedRegistrationIdentifier = identifier;
      } else {
        // Onsite payment: no file upload needed
        const {
          rpcResults: { registrationId },
          identifier,
        } = await submitRegistrationRPC({
          eventId: eventDetails?.eventId,
          step1: parsedRegistrationData.step1,
          step2: parsedRegistrationData.step2,
          step3: {
            paymentMethod: "onsite",
          },
          step4: parsedRegistrationData.step4,
        });
        returnedRegistrationId = registrationId;
        returnedRegistrationIdentifier = identifier;
      }
      setCreatedRegistrationId(returnedRegistrationId);

      if (!returnedRegistrationId || !returnedRegistrationIdentifier) {
        throw new Error("Failed to create registration");
      }
      return { returnedRegistrationId, returnedRegistrationIdentifier };
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
