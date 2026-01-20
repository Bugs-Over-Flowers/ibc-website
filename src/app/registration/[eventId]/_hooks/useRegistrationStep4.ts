import { revalidateLogic } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import useRegistrationStore from "@/hooks/registration.store";
import {
  StandardRegistrationSchema,
  StandardRegistrationStep4Schema,
} from "@/lib/validation/registration/standard";
import { useSendRegistrationEmail } from "./useSendRegistrationEmail";
import { useSubmitRegistration } from "./useSubmitRegistration";

/**
 * Hook for handling Step 4 (final confirmation) of the registration process.
 *
 * TWO-PHASE REGISTRATION FLOW:
 *
 * Phase 1 - Create Registration:
 * 1. Validate all 4 steps of registration data
 * 2. Submit to database via submitRegistration
 * 3. Receive registrationId and identifier
 *
 * Phase 2 - Send Confirmation Email:
 * 4. Send confirmation email with QR code to registrant
 * 5. If email fails → rollback registration (delete from database)
 * 6. Set cookie with QR data for success page
 * 7. Navigate to /registration/success
 *
 * Why two phases:
 * - Registration must succeed before sending email (can't email without ID)
 * - Email failure should rollback registration (data consistency)
 * - Both operations must succeed for complete registration
 *
 * Error handling:
 * - If Phase 1 fails: user stays on form, can retry
 * - If Phase 2 fails: registration is deleted, user must start over
 *
 * @returns TanStack Form instance configured for Step 4 submission
 */
export const useRegistrationStep4 = () => {
  const router = useRouter();

  const registrationData = useRegistrationStore(
    (state) => state.registrationData,
  );
  const setRegistrationData = useRegistrationStore(
    (state) => state.setRegistrationData,
  );

  // const eventDetails = useRegistrationStore((state) => state.eventDetails);

  const { execute: submitRegistration } = useSubmitRegistration();
  const { execute: sendEmail } = useSendRegistrationEmail();
  const form = useAppForm({
    defaultValues: registrationData.step4,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: StandardRegistrationStep4Schema,
      // onSubmit: zodValidator(StandardRegistrationStep4Schema),
    },
    onSubmit: async ({ value }) => {
      const refinedValue = StandardRegistrationStep4Schema.parse(value);

      // Save step 4 data to store
      setRegistrationData({
        step4: refinedValue,
      });

      // Validate complete registration data (all 4 steps)
      const refinedRegistrationData = StandardRegistrationSchema.safeParse({
        ...registrationData,
        step4: refinedValue,
      });

      if (!refinedRegistrationData.success) {
        toast.error(
          `Invalid registration data. Please check your previous inputs.`,
        );
        return;
      }

      // ========== PHASE 1: Create Registration ==========
      const { data } = await submitRegistration(refinedRegistrationData.data);

      if (!data) return;

      const { returnedRegistrationId, returnedRegistrationIdentifier } = data;

      // ========== PHASE 2: Send Email (with rollback on failure) ==========
      const { error: sendEmailError } = await sendEmail(
        returnedRegistrationId,
        returnedRegistrationIdentifier,
      );
      // Note: If email fails, the registration will be deleted inside useSendRegistrationEmail
      if (sendEmailError) return;

      // ========== SUCCESS: Navigate to confirmation page ==========
      // if (!eventDetails?.eventId) {
      //   router.push("/events");
      //   return;
      // }
      router.push(`/registration/success`);
    },
  });

  return form;
};
