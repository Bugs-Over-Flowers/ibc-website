"use client";

import { Mail, Phone, QrCode } from "lucide-react";
import { useState } from "react";
import { ParticipantQRCodeDialog } from "@/app/admin/events/[eventId]/registration-list/_components/participants/ParticipantQRCodeDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ParticipantCardProps {
  fullName: string;
  email: string;
  contactNumber: string;
  registrant?: boolean;
  participantIdentifier?: string;
  affiliation: string;
}

export default function ParticipantCard({
  fullName,
  email,
  contactNumber,
  registrant,
  participantIdentifier,
  affiliation,
}: ParticipantCardProps) {
  const [qrOpen, setQrOpen] = useState(false);
  const initials = fullName
    .split(" ")
    .map((namePart) => namePart[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <Card
        className={cn(
          "h-full rounded-xl border border-border/50 bg-background shadow-none",
          registrant && "border-primary/40 bg-primary/5",
        )}
        data-testid="participant-card"
      >
        <CardContent className="space-y-4 px-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-xs",
                  registrant
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-base text-foreground leading-tight">
                  {fullName}
                </p>
                <p className="mt-1 text-muted-foreground text-xs">
                  Participant
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {registrant ? (
                <Badge variant="secondary">Registrant</Badge>
              ) : null}
              {participantIdentifier && (
                <Button
                  aria-label="Show QR code"
                  className="size-7 p-0"
                  onClick={() => setQrOpen(true)}
                  size="sm"
                  variant="ghost"
                >
                  <QrCode className="size-3.5" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{contactNumber}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {participantIdentifier && (
        <ParticipantQRCodeDialog
          affiliation={affiliation}
          email={email}
          onOpenChange={setQrOpen}
          open={qrOpen}
          participantIdentifier={participantIdentifier}
          participantName={fullName}
        />
      )}
    </>
  );
}
