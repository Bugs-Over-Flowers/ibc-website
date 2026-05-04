"use client";

import { QrCode } from "lucide-react";
import { useState } from "react";
import { ParticipantQRCodeDialog } from "@/app/admin/events/[eventId]/registration-list/_components/participants/ParticipantQRCodeDialog";
import { Button } from "@/components/ui/button";

interface ParticipantRowProps {
  name: string;
  email: string;
  participantIdentifier: string;
  isPrincipal: boolean;
  affiliation: string;
}

export default function ParticipantRow({
  name,
  email,
  participantIdentifier,
  isPrincipal,
  affiliation,
}: ParticipantRowProps) {
  const [qrOpen, setQrOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-medium text-sm">{name}</span>
          {isPrincipal && (
            <span className="ml-2 text-[10px] text-muted-foreground uppercase tracking-wider">
              Registrant
            </span>
          )}
          <p className="mt-1 text-muted-foreground text-xs">{email}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <code className="text-muted-foreground text-xs">
            {participantIdentifier}
          </code>
          <Button
            aria-label="Show QR code"
            className="size-7 p-0"
            onClick={() => setQrOpen(true)}
            size="sm"
            variant="ghost"
          >
            <QrCode className="size-3.5" />
          </Button>
        </div>
      </div>

      <ParticipantQRCodeDialog
        affiliation={affiliation}
        email={email}
        onOpenChange={setQrOpen}
        open={qrOpen}
        participantIdentifier={participantIdentifier}
        participantName={name}
      />
    </>
  );
}
