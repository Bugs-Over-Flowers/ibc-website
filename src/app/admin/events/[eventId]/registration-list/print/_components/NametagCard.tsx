"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { generateQRDataUrl } from "@/lib/qr/generateQRCode";
import type { ParticipantForPrint } from "@/server/registration/queries/getEventParticipantsForPrint";

interface NametagCardProps {
  eventTitle: string;
  participant: ParticipantForPrint;
}

export default function NametagCard({ participant }: NametagCardProps) {
  const [qrUrl, setQrUrl] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    const generate = async () => {
      try {
        const url = await generateQRDataUrl(participant.registrationIdentifier);
        if (!cancelled) setQrUrl(url);
      } catch {
        // ignore
      }
    };
    generate();
    return () => {
      cancelled = true;
    };
  }, [participant.registrationIdentifier]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-between overflow-hidden rounded-[6mm] border border-neutral-200 bg-white p-[5mm]">
      {/* Logo */}
      <div className="relative mt-1 h-8 w-24">
        <Image
          alt="IBC Logo"
          className="object-contain"
          fill
          sizes="96px"
          src="/logo/ibc-logo.png"
        />
      </div>

      {/* Name */}
      <div className="flex flex-col items-center text-center">
        <p className="max-w-full truncate font-bold text-neutral-900 text-xl uppercase leading-tight">
          {participant.firstName}
        </p>
        <p className="max-w-full truncate font-bold text-neutral-900 text-xl uppercase leading-tight">
          {participant.lastName}
        </p>
      </div>

      {/* Affiliation */}
      <p className="max-w-full truncate font-medium text-neutral-500 text-sm capitalize">
        {participant.affiliation || "—"}
      </p>

      {/* QR Code */}
      <div className="flex flex-col items-center gap-1">
        <div className="relative size-24">
          {qrUrl ? (
            <Image
              alt="Check-in QR Code"
              className="object-contain"
              fill
              sizes="96px"
              src={qrUrl}
            />
          ) : (
            <div className="size-full animate-pulse rounded-lg bg-neutral-200" />
          )}
        </div>
        <p className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest">
          {participant.registrationIdentifier}
        </p>
      </div>
    </div>
  );
}
