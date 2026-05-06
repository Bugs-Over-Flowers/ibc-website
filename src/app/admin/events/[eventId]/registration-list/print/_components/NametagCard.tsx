import IBCLogo from "@/../public/logo/ibc-logo.png";
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
      <div className="size-25">
        {/** biome-ignore lint/performance/noImgElement: Needed for printing */}
        <img
          alt="IBC Logo"
          className="size-full object-contain"
          src={IBCLogo.src}
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

      {/* Participant Identifier */}
      <div className="flex flex-col items-center gap-1">
        <p className="font-bold font-mono text-neutral-900 text-sm tracking-widest">
          {participant.registrationIdentifier}
        </p>
        <p className="font-mono text-[7px] text-neutral-400 tracking-wider">
          PARTICIPANT ID
        </p>
      </div>

      {/* Event name */}
      <p className="max-w-full truncate text-[8px] text-neutral-400 leading-tight">
        {eventTitle}
      </p>
    </div>
  );
}
