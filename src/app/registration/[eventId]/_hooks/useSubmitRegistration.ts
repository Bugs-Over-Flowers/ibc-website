import { toast } from "sonner";
import useRegistrationStore from "@/hooks/registration.store";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { uploadPaymentProof } from "@/lib/storage/uploadPaymentProof";
import type { StandardRegistrationSchema } from "@/lib/validation/registration/standard";
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
    tryCatch(async (registrationData: StandardRegistrationSchema) => {
      // Validate eventId exists
      if (!eventDetails?.eventId) {
        throw new Error("Event ID is missing");
      }

      const { step3 } = registrationData;

      /**
       * PAYMENT PROOF UPLOAD FLOW
       *
       * For online payments:
       * 1. Upload File to Supabase storage
       * 2. Receive storage path for database
       *
       * For onsite payments:
       * - Skip upload, no proof required
       */
      let paymentProofPath: string | undefined;
      if (step3.paymentMethod === "online" && step3.paymentProof) {
        paymentProofPath = await uploadPaymentProof(step3.paymentProof);
      }

      // Submit registration with appropriate payment data
      const {
        rpcResults: { registrationId },
        identifier,
      } = await submitRegistrationRPC({
        eventId: eventDetails.eventId,
        step1: registrationData.step1,
        step2: registrationData.step2,
        step3: paymentProofPath
          ? { paymentMethod: "online", path: paymentProofPath }
          : { paymentMethod: "onsite" },
        step4: registrationData.step4,
      });

      setCreatedRegistrationId(registrationId);

      return {
        returnedRegistrationId: registrationId,
        returnedRegistrationIdentifier: identifier,
      };
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
