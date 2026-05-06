"use client";

import Image from "next/image";
import type { ParticipantForPrint } from "@/server/registration/queries/getEventParticipantsForPrint";

interface NametagCardProps {
  eventTitle: string;
  participant: ParticipantForPrint;
}

export default function NametagCard({
  eventTitle,
  participant,
}: NametagCardProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-between overflow-hidden rounded-[6mm] border border-neutral-200 bg-white p-[4mm] pt-[3mm]">
      {/* Logo */}
      <div className="relative size-25">
        <Image
          alt="IBC Logo"
          className="object-contain"
          fill
          sizes="120px"
          src="/logo/ibc-logo.png"
        />
      </div>

      {/* Name */}
      <div className="-mt-1 flex flex-col items-center text-center">
        <p className="max-w-full truncate font-bold text-lg text-neutral-900 uppercase leading-tight">
          {participant.firstName}
        </p>
        <p className="max-w-full truncate font-bold text-lg text-neutral-900 uppercase leading-tight">
          {participant.lastName}
        </p>
      </div>

      {/* Affiliation */}
      <p className="-mt-0.5 max-w-full truncate font-medium text-neutral-500 text-xs capitalize">
        {participant.affiliation || ""}
      </p>

      {/* QR Code */}
      <div className="flex flex-col items-center gap-1">
        <div className="relative size-[22mm]">
          {participant.qrDataUrl ? (
            <Image
              alt="Check-in QR Code"
              className="object-contain"
              fill
              sizes="88px"
              src={participant.qrDataUrl}
            />
          ) : (
            <div className="size-full rounded-lg bg-neutral-100" />
          )}
        </div>
        <p className="font-mono text-[8px] text-neutral-400 uppercase tracking-wider">
          {participant.registrationIdentifier}
        </p>
      </div>

      {/* Event name */}
      <p className="max-w-full truncate text-[8px] text-neutral-400 leading-tight">
        {eventTitle}
      </p>
    </div>
  );
}
