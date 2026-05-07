import type { ParticipantForPrint } from "@/server/registration/queries/getEventParticipantsForPrint";
import NametagCard from "./NametagCard";

interface NametagGridProps {
  eventTitle: string;
  participants: ParticipantForPrint[];
}

const NAMETAGS_PER_PAGE = 6;

export default function NametagGrid({
  eventTitle,
  participants,
}: NametagGridProps) {
  const pages: ParticipantForPrint[][] = [];
  for (let i = 0; i < participants.length; i += NAMETAGS_PER_PAGE) {
    pages.push(participants.slice(i, i + NAMETAGS_PER_PAGE));
  }

  return (
    <div className="flex flex-col items-center">
      {pages.map((pageParticipants) => (
        <div
          className="grid h-[297mm] w-[210mm] break-after-page grid-cols-2 grid-rows-3 gap-[4mm] bg-white p-[10mm] last:break-after-auto"
          key={pageParticipants[0]?.participantId ?? "empty"}
        >
          {pageParticipants.map((participant) => (
            <NametagCard
              eventTitle={eventTitle}
              key={participant.participantId}
              participant={participant}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
