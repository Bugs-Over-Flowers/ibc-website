import { toast } from "sonner";
import z from "zod";
import { useAppForm } from "@/hooks/_formHooks";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { resendQRCode } from "@/server/emails/actions/resendQRCode";

interface UseResendEmailProps {
  email: string;
  registrationId: string;
  eventId: string;
  registrationIdentifier: string;
}

export const useResendEmail = ({
  email,
  registrationId,
  registrationIdentifier,
  eventId,
}: UseResendEmailProps) => {
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
      // encode QR Code
      await execute({
        toEmail: value.email,
        qrData: registrationIdentifier,
        registrationId,
        eventId,
      });
    },
  });

  return form;
};
