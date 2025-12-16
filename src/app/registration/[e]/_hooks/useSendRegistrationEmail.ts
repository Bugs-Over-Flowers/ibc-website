import { toast } from "sonner";
import useRegistrationStore from "@/hooks/registration.store";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";

import { setCookieData } from "@/server/actions.utils";
import { sendRegistrationConfirmationEmail } from "@/server/emails/actions/sendRegistrationConfirmationEmail";
import { deleteRegistration } from "@/server/registration/actions/deleteRegistration";

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
        console.error(error);
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
        // attempt to remove the registration
      },
    },
  );
};
