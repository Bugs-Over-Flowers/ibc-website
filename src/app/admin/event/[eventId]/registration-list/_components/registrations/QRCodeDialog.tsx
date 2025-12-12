"use client";

import { RotateCcw } from "lucide-react";
import Image from "next/image";
import {
  type FormEvent,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { useAction } from "@/hooks/useAction";
import { generateQRDataUrl } from "@/lib/qr/generateQRCode";
import tryCatch from "@/lib/server/tryCatch";
import { RegistrationCheckInQRCodeDecodedSchema } from "@/lib/validation/qr/standard";
import { encryptRegistrationQR } from "@/server/attendance/actions/encryptRegistrationQR";
import { useResendEmail } from "../../_hooks/useResendEmail";

interface QRCodeDialogProps {
  email: string;
  open: boolean;
  registrationId: string;
  setOpen: (open: boolean) => void;
  eventId: string;
}

export default function QRCodeDialog({
  email,
  open,
  registrationId,
  setOpen,
  eventId,
}: QRCodeDialogProps) {
  const form = useResendEmail({ email, registrationId, eventId });

  const qrPayload = useMemo(
    () =>
      RegistrationCheckInQRCodeDecodedSchema.parse({
        email,
        registrationId,
        eventId,
      }),
    [email, registrationId, eventId],
  );

  const [qrURL, setQRURL] = useState("");

  const { execute: loadEncryptedQR, isPending: isLoadingQR } = useAction(
    tryCatch(encryptRegistrationQR),
    {
      onSuccess: async (response) => {
        const url = await generateQRDataUrl(response.encodedString);
        setQRURL(url);
      },
    },
  );

  const getEncryptedQRCode = useEffectEvent(() => {
    loadEncryptedQR(qrPayload);
  });

  useEffect(() => {
    if (!open) return;
    getEncryptedQRCode();
  }, [open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    form.handleSubmit();
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
            <DialogDescription>
              QR Code details for registrant id: {registrationId}
            </DialogDescription>
          </DialogHeader>
          <form.AppField name="email">
            {(field) =>
              isLoadingQR || qrURL === "" ? (
                <div className="relative size-50">
                  <Skeleton className="absolute h-full w-full bg-neutral-300" />
                </div>
              ) : (
                <>
                  <div className="relative size-50">
                    <Image alt="QR Code" fill src={qrURL} />
                  </div>
                  <Field>
                    <h4>Resend QR Code</h4>
                    <div className="flex gap-2">
                      <field.TextField label="Send to" />
                      {field.state.value !== email && (
                        <Button
                          className="self-end"
                          onClick={() => field.handleChange(email)}
                          type="button"
                        >
                          <RotateCcw />
                        </Button>
                      )}
                    </div>
                  </Field>
                </>
              )
            }
          </form.AppField>
          <DialogFooter>
            <form.AppForm>
              <form.SubmitButton
                isSubmittingLabel="Sending Email"
                label="Resend Email"
              />
            </form.AppForm>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
