"use client";

import { RotateCcw } from "lucide-react";
import Image from "next/image";
import { type FormEvent, useEffect, useState } from "react";
import { useResendEmail } from "@/app/admin/events/[eventId]/registration-list/_hooks/useResendEmail";
import QRDownloader from "@/components/qr/QRDownloader";
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
import { generateQRDataUrl } from "@/lib/qr/generateQRCode";

interface QRCodeDialogProps {
  email: string;
  open: boolean;
  registrationId: string;
  registrationIdentifier: string;
  setOpen: (open: boolean) => void;
  eventId: string;
  affiliation: string;
}

export default function QRCodeDialog({
  email,
  open,
  registrationId,
  registrationIdentifier,
  setOpen,
  eventId,
  affiliation,
}: QRCodeDialogProps) {
  const form = useResendEmail({
    email,
    registrationId,
    eventId,
    registrationIdentifier,
  });

  const [qrURL, setQRURL] = useState<string>("");

  useEffect(() => {
    const generateURL = async () => {
      const url = await generateQRDataUrl(registrationIdentifier);
      setQRURL(url);
    };
    generateURL();
  }, [registrationIdentifier]);

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
              Registration Identifier:{" "}
              <strong> {registrationIdentifier}</strong>
            </DialogDescription>
          </DialogHeader>
          <form.AppField name="email">
            {(field) =>
              qrURL === "" ? (
                <div className="relative size-50">
                  <Skeleton className="absolute h-full w-full bg-neutral-300" />
                </div>
              ) : (
                <>
                  <QRDownloader
                    affiliation={affiliation}
                    email={email}
                    registrationIdentifier={registrationIdentifier}
                  >
                    <div className="relative size-50">
                      <Image alt="QR Code" fill src={qrURL} />
                    </div>
                  </QRDownloader>
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
