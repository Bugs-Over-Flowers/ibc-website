import { toast } from "sonner";
import useRegistrationStore from "@/hooks/registration.store";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { RegistrationCheckInQRCodeDecodedSchema } from "@/lib/validation/qr/standard";
import { setCookieData } from "@/server/actions.utils";
import { encryptRegistrationQR } from "@/server/attendance/actions/encryptRegistrationQR";
import { sendRegistrationConfirmationEmail } from "@/server/emails/actions/sendRegistrationConfirmationEmail";

export const useSendRegistrationEmail = () => {
  const registrationData = useRegistrationStore(
    (state) => state.registrationData,
  );
  const eventDetails = useRegistrationStore((state) => state.eventDetails);
  return useAction(
    tryCatch(async (registrationId: string) => {
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

      // validate the email, registration id, and event id
      const { data, error: validationError } =
        RegistrationCheckInQRCodeDecodedSchema.safeParse({
          email: registrationData.step2.registrant.email,
          registrationId: registrationId,
          eventId: eventDetails.eventId,
        });

      if (validationError) {
        throw new Error("Invalid data for sending registration email");
      }

      // generate a new qrcode data
      const { encodedString: encodedQRData } =
        await encryptRegistrationQR(data);

      // set cookies for qrdata
      await setCookieData("recentQRData", encodedQRData);

      const selfName = `${registrationData.step2.registrant.firstName} ${registrationData.step2.registrant.lastName}`;

      await sendRegistrationConfirmationEmail({
        selfName,
        registrationId: data.registrationId,
        eventDetails,
        toEmail: data.email,
        encodedQRData,
        otherParticipants: registrationData.step2.otherParticipants
          ? registrationData.step2.otherParticipants.map((participant) => ({
              fullName: `${participant.firstName} ${participant.lastName}`,
              email: participant.email,
            }))
          : [],
      });
    }),
    {
      onSuccess: () => {
        toast.success("Email sent successfully!");
      },
      onError: (error) => {
        toast.error(`Email sending failed: ${error}`);
      },
    },
  );
};
