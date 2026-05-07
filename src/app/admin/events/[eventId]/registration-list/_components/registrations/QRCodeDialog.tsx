"use client";

import { QrCode, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
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

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    form.handleSubmit();
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="max-w-sm">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-medium text-base">
              <QrCode className="size-4 text-muted-foreground" />
              QR Code
            </DialogTitle>
            <DialogDescription>
              Registration ID:{" "}
              <strong className="font-medium text-foreground">
                {registrationIdentifier}
              </strong>
            </DialogDescription>
          </DialogHeader>

          <form.AppField name="email">
            {(field) =>
              qrURL === "" ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border bg-muted/30 p-4">
                  <Skeleton className="size-[120px] bg-neutral-300" />
                  <Skeleton className="h-3 w-24 bg-neutral-300" />
                </div>
              ) : (
                <>
                  <QRDownloader
                    email={email}
                    header={affiliation}
                    registrationIdentifier={registrationIdentifier}
                  >
                    <div className="flex w-[200px] flex-col items-center gap-2 rounded-lg border bg-white p-4">
                      <div className="relative size-[160px]">
                        <Image alt="QR Code" fill sizes="120px" src={qrURL} />
                      </div>

                      <span className="wrap-break-word text-center font-medium font-mono text-neutral-900 text-xs">
                        {registrationIdentifier}
                      </span>
                    </div>
                  </QRDownloader>

                  <div className="space-y-2 pt-1">
                    <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                      Resend QR Code
                    </p>
                    <Field>
                      <div className="flex gap-2">
                        <field.TextField label="Send to" />
                        {field.state.value !== email && (
                          <Button
                            className="self-end"
                            onClick={() => field.handleChange(email)}
                            size="icon"
                            type="button"
                            variant="outline"
                          >
                            <RotateCcw className="size-4" />
                          </Button>
                        )}
                      </div>
                    </Field>
                  </div>
                </>
              )
            }
          </form.AppField>

          <DialogFooter>
            <form.AppForm>
              <form.SubmitButton
                isSubmittingLabel="Sending..."
                label="Resend Email"
              />
            </form.AppForm>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
