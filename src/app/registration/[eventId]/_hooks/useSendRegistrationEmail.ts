import { toast } from "sonner";
import useRegistrationStore from "@/hooks/registration.store";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";

import { setCookieData } from "@/server/actions.utils";
import { sendRegistrationConfirmationEmail } from "@/server/emails/actions/sendRegistrationConfirmationEmail";
import { deleteRegistration } from "@/server/registration/actions/deleteRegistration";

/**
 * Hook for sending registration confirmation email with QR code.
 *
 * CRITICAL: This hook implements a rollback mechanism.
 *
 * Flow:
 * 1. Set cookie with QR identifier for success page
 * 2. Send confirmation email to registrant (and other participants)
 * 3. If email fails → DELETE the registration from database
 *
 * Why rollback on email failure:
 * - Users expect to receive confirmation email with QR code
 * - Without email, users cannot access their registration details
 * - Orphaned registrations (in DB but no email) cause support issues
 * - Better UX: fail fast and let user retry complete flow
 *
 * Data consistency strategy:
 * - Registration without email = incomplete transaction
 * - Delete ensures database doesn't have "zombie" registrations
 * - User must re-submit entire form if email service fails
 *
 * @returns useAction hook with execute function for sending email
 *
 * @example
 * const { execute: sendEmail } = useSendRegistrationEmail();
 * const { error } = await sendEmail(registrationId, identifier);
 * if (error) {
 *   // Registration has been deleted, user must retry
 * }
 */
export const useSendRegistrationEmail = () => {
  const registrationData = useRegistrationStore(
    (state) => state.registrationData,
  );
  const eventDetails = useRegistrationStore((state) => state.eventDetails);
  return useAction(
    tryCatch(async (registrationId: string, identifier: string) => {
      // check for eventId
      if (!eventDetails?.eventId) {
        throw new Error("Event ID is missing");
      }

      // ensure step2 exists
      if (!registrationData.step2) {
        throw new Error("Step 2 data is missing");
      }

      // check for registrationId
      if (!registrationId) {
        throw new Error("Registration ID is missing");
      }

      // set cookies for qrdata
      await setCookieData("recentQRData", identifier);

      const selfName = `${registrationData.step2.registrant.firstName} ${registrationData.step2.registrant.lastName}`;

      const { error } = await tryCatch(
        sendRegistrationConfirmationEmail({
          selfName,
          eventDetails,
          toEmail: registrationData.step2.registrant.email,
          identifier,
          otherParticipants: registrationData.step2.otherParticipants
            ? registrationData.step2.otherParticipants.map((participant) => ({
                fullName: `${participant.firstName} ${participant.lastName}`,
                email: participant.email,
              }))
            : [],
        }),
      );

      if (error) {
        // ROLLBACK: Delete the registration since email failed
        // This maintains data consistency - registrations without emails are incomplete
        await deleteRegistration(registrationId);
        throw new Error(error);
      }
    }),
    {
      onSuccess: () => {
        toast.success("Email sent successfully!");
      },
      onError: async (error) => {
        toast.error(`Email sending failed: ${error}`);
        // Note: Registration has already been deleted in the main function
      },
    },
  );
};
