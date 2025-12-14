import { toast } from "sonner";
import z from "zod";
import { useAppForm } from "@/hooks/_formHooks";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { RegistrationCheckInQRCodeDecodedSchema } from "@/lib/validation/qr/standard";
import { encryptRegistrationQR } from "@/server/attendance/actions/encryptRegistrationQR";
import { resendQRCode } from "@/server/emails/actions/resendQRCode";

export const useResendEmail = ({
  email,
  registrationId,
  eventId,
}: {
  email: string;
  registrationId: string;
  eventId: string;
}) => {
  const { execute } = useAction(tryCatch(resendQRCode), {
    onSuccess: () => {
      toast.success("QR code has been resent");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const form = useAppForm({
    defaultValues: {
      email,
    },
    validators: {
      onSubmit: z.object({
        email: z.email(),
      }),
    },
    onSubmit: async ({ value }) => {
      const formData = RegistrationCheckInQRCodeDecodedSchema.safeParse({
        eventId,
        registrationId,
        email: value.email,
      });

      if (!formData.success) {
        toast.error("Invalid QR code");
        return;
      }

      // encode QR Code
      const { encodedString: encodedQRData } = await encryptRegistrationQR(
        formData.data,
      );

      await execute({
        toEmail: formData.data.email,
        encodedQRData,
        registrationId,
        eventId,
      });
    },
  });

  return form;
};
