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
    <div className="flex h-full w-full items-stretch gap-[2mm] overflow-hidden bg-white p-[2mm]">
      <div className="flex w-[30mm] flex-col items-center justify-center gap-1">
        <div className="relative size-[26mm]">
          {participant.qrDataUrl ? (
            <Image
              alt="Check-in QR Code"
              className="object-contain"
              fill
              src={participant.qrDataUrl}
            />
          ) : (
            <div className="size-full rounded-lg bg-neutral-100" />
          )}
        </div>
        <p className="font-mono text-[7px] text-neutral-500 tracking-wider">
          {participant.participantIdentifier}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-[1mm]">
        {/** biome-ignore lint/performance/noImgElement: needed for printing */}
        <img
          alt="IBC Logo"
          className="h-[8mm] w-auto self-start object-contain"
          src="/logo/ibc-logo.png"
        />
        <p className="mt-2 max-w-full font-bold text-neutral-900 text-sm leading-tight">
          {participant.firstName} {participant.lastName}
        </p>
        <p className="max-w-full text-[10px] text-neutral-600 leading-tight">
          {participant.affiliation || ""}
        </p>
        <p className="mt-auto max-w-full truncate text-[7px] text-neutral-400 leading-tight">
          {eventTitle}
        </p>
      </div>
    </div>
  );
}
