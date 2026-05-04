import { toast } from "sonner";
import useRegistrationStore from "@/hooks/registration.store";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { uploadPaymentProof } from "@/lib/storage/uploadPaymentProof";
import type { StandardRegistrationSchema } from "@/lib/validation/registration/standard";
import { submitRegistrationRPC } from "@/server/registration/mutations/submitRegistrationRPC";

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
  const sponsoredRegistrationId = useRegistrationStore(
    (state) => state.sponsoredRegistrationId,
  );

  const setCreatedRegistrationId = useRegistrationStore(
    (state) => state.setCreatedRegistrationId,
  );

  const getRegistrationErrorMessage = (error: string) => {
    const normalizedError = error.toLowerCase();

    const isSponsoredSlotExceeded =
      normalizedError.includes("not enough sponsored registration slots") ||
      normalizedError.includes("sponsoredregistration_used_check") ||
      (normalizedError.includes("sponsored") &&
        (normalizedError.includes("slot") ||
          normalizedError.includes("maxsponsoredguests") ||
          normalizedError.includes("usedcount")));

    if (isSponsoredSlotExceeded) {
      return "Not enough sponsored registration slots for this registrant. Please use another sponsor link or reduce participants.";
    }

    return `Registration failed: ${error}`;
  };

  return useAction(
    tryCatch(async (registrationData: StandardRegistrationSchema) => {
      if (!eventDetails?.eventId) {
        throw new Error("Event ID is missing");
      }

      const { step3 } = registrationData;

      let paymentProofPaths: string[] = [];
      if (step3.paymentMethod === "online" && step3.paymentProofs) {
        paymentProofPaths = await Promise.all(
          step3.paymentProofs.map((file) => uploadPaymentProof(file)),
        );
      }

      const {
        rpcResults: { registrationId },
        identifier,
        participants,
      } = await submitRegistrationRPC({
        eventId: eventDetails.eventId,
        step1: registrationData.step1,
        step2: registrationData.step2,
        step3:
          paymentProofPaths.length > 0
            ? { paymentMethod: "online", paths: paymentProofPaths }
            : { paymentMethod: "onsite" },
        step4: registrationData.step4,
        sponsoredRegistrationId: sponsoredRegistrationId || null,
      });

      setCreatedRegistrationId(registrationId);

      return {
        returnedRegistrationId: registrationId,
        returnedRegistrationIdentifier: identifier,
        participants: participants ?? [],
      };
    }),
    {
      onSuccess: () => {
        toast.success("Registration successful!");
      },
      onError: (error) => {
        toast.error(getRegistrationErrorMessage(error));
      },
    },
  );
};
