"use client";

import { QrCode } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import QRDownloader from "@/components/qr/QRDownloader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { generateQRDataUrl } from "@/lib/qr/generateQRCode";

interface ParticipantQRCodeDialogProps {
  participantIdentifier: string;
  email: string;
  participantName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  affiliation: string;
}

export function ParticipantQRCodeDialog({
  participantIdentifier,
  email,
  participantName,
  open,
  onOpenChange,
  affiliation,
}: ParticipantQRCodeDialogProps) {
  const [qrUrl, setQrUrl] = useState<string>("");

  useEffect(() => {
    if (open && participantIdentifier) {
      generateQRDataUrl(participantIdentifier).then(setQrUrl);
    }
  }, [open, participantIdentifier]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-medium text-base">
            <QrCode className="size-4 text-muted-foreground" />
            {participantName}
          </DialogTitle>
          <DialogDescription>
            Participant Identifier:{" "}
            <strong className="font-medium text-foreground">
              {participantIdentifier}
            </strong>
          </DialogDescription>
        </DialogHeader>

        {qrUrl === "" ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border bg-muted/30 p-4">
            <Skeleton className="size-[120px] bg-neutral-300" />
            <Skeleton className="h-3 w-24 bg-neutral-300" />
          </div>
        ) : (
          <QRDownloader
            email={email}
            header={participantName}
            registrationIdentifier={participantIdentifier}
            subheader={affiliation}
          >
            <div className="flex w-[200px] flex-col items-center gap-2 rounded-lg border bg-white p-4">
              <div className="relative size-[160px]">
                <Image alt="QR Code" fill sizes="120px" src={qrUrl} />
              </div>
              <span className="wrap-break-word text-center font-medium font-mono text-neutral-900 text-xs">
                {participantIdentifier}
              </span>
            </div>
          </QRDownloader>
        )}
      </DialogContent>
    </Dialog>
  );
}
