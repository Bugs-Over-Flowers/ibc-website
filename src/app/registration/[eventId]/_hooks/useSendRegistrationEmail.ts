import { toast } from "sonner";
import useRegistrationStore from "@/hooks/registration.store";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";

import { setCookieData } from "@/server/actions.utils";
import { sendParticipantNotificationEmail } from "@/server/emails/mutations/sendParticipantNotificationEmail";
import { sendRegistrationConfirmationEmail } from "@/server/emails/mutations/sendRegistrationConfirmationEmail";
import { deleteRegistration } from "@/server/registration/mutations/deleteRegistration";

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
interface EmailParticipant {
  fullName: string;
  email: string;
  affiliation: string;
  participantIdentifier: string;
  isPrincipal: boolean;
}

type EmailRecipientGroup = {
  email: string;
  participants: EmailParticipant[];
  isRegistrant: boolean;
};

export const useSendRegistrationEmail = () => {
  const registrationData = useRegistrationStore(
    (state) => state.registrationData,
  );
  const eventDetails = useRegistrationStore((state) => state.eventDetails);
  return useAction(
    tryCatch(
      async (
        registrationId: string,
        identifier: string,
        participants: EmailParticipant[],
        affiliation: string,
      ) => {
        if (!eventDetails?.eventId) {
          throw new Error("Event ID is missing");
        }

        if (!registrationData.step2) {
          throw new Error("Step 2 data is missing");
        }

        if (!registrationId) {
          throw new Error("Registration ID is missing");
        }

        await setCookieData("recentQRData", identifier);

        const selfName = `${registrationData.step2.registrant.firstName} ${registrationData.step2.registrant.lastName}`;
        const selfAffiliation = affiliation;
        const registrantEmail = registrationData.step2.registrant.email;

        const groupedRecipients = new Map<string, EmailRecipientGroup>();

        for (const participant of participants) {
          const current = groupedRecipients.get(participant.email);

          if (current) {
            current.participants.push(participant);
          } else {
            groupedRecipients.set(participant.email, {
              email: participant.email,
              participants: [participant],
              isRegistrant: participant.email === registrantEmail,
            });
          }
        }

        const registrantGroup =
          groupedRecipients.get(registrantEmail)?.participants ?? [];
        const registrantParticipant =
          registrantGroup.find((participant) => participant.isPrincipal) ??
          registrantGroup[0];

        // Send registrant confirmation email
        const { error: registrantError } = await tryCatch(
          sendRegistrationConfirmationEmail({
            selfName,
            selfAffiliation,
            eventDetails,
            toEmail: registrantEmail,
            identifier,
            participantIdentifier:
              registrantParticipant?.participantIdentifier ?? identifier,
            participants: participants
              .filter(
                (participant) =>
                  participant.participantIdentifier !==
                  registrantParticipant?.participantIdentifier,
              )
              .map((participant) => ({
                fullName: participant.fullName,
                email: participant.email,
                affiliation: participant.affiliation,
                participantIdentifier: participant.participantIdentifier,
              })),
          }),
        );

        if (registrantError) {
          await deleteRegistration(registrationId);
          throw new Error(registrantError);
        }

        // Send individual participant notification emails
        for (const group of Array.from(groupedRecipients.values()).filter(
          (entry) => !entry.isRegistrant,
        )) {
          const { error: participantError } = await tryCatch(
            sendParticipantNotificationEmail({
              toEmail: group.email,
              participants: group.participants.map((participant) => ({
                participantName: participant.fullName,
                participantIdentifier: participant.participantIdentifier,
                affiliation: participant.affiliation,
                email: participant.email,
              })),
              registrantName: selfName,
              eventDetails,
              registrationIdentifier: identifier,
            }),
          );

          if (participantError) {
            await deleteRegistration(registrationId);
            throw new Error(
              `Failed to send notification to ${group.email}: ${participantError}`,
            );
          }
        }
      },
    ),
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
