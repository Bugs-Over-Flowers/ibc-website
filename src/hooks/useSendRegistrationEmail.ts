import { toast } from "sonner";
import tryCatch from "@/lib/server/tryCatch";
import { RegistrationCheckInQRCodeDecodedSchema } from "@/lib/validation/qr/standard";
import { setCookieData } from "@/server/actions.utils";
import { encryptRegistrationQR } from "@/server/attendance/actions/encryptRegistrationQR";
import { sendRegistrationConfirmationEmail } from "@/server/emails/actions/sendRegistrationConfirmationEmail";
import useRegistrationStore from "./registration.store";
import { useAction } from "./useAction";

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
          email: registrationData.step2.principalRegistrant.email,
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

      const selfName = `${registrationData.step2.principalRegistrant.firstName} ${registrationData.step2.principalRegistrant.lastName}`;

      await sendRegistrationConfirmationEmail({
        selfName,
        eventDetails,
        toEmail: data.email,
        encodedQRData,
        otherParticipants: registrationData.step2.otherRegistrants
          ? registrationData.step2.otherRegistrants.map((participant) => ({
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
