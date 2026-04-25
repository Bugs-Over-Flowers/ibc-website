import { Building2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type ParticipantSummary = {
  id: string;
  firstName: string;
  lastName: string;
};

interface Step4RegistrantReviewSectionProps {
  memberLabel: string;
  memberName?: string;
  registrant: {
    firstName: string;
    lastName: string;
  };
  otherParticipants?: ParticipantSummary[];
}

function ParticipantCard({
  firstName,
  isPrimary,
  lastName,
}: {
  firstName: string;
  isPrimary: boolean;
  lastName: string;
}) {
  return (
    <li
      className={
        isPrimary
          ? "grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border border-primary/60 bg-primary/5 p-4 shadow-primary/10 shadow-sm transition-colors"
          : "grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border border-border/50 bg-background p-4 shadow-sm transition-colors"
      }
    >
      <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-center font-bold text-primary text-sm leading-10">
        {firstName?.[0] || ""}
        {lastName?.[0] || ""}
      </div>
      <div className="min-w-0">
        <p className="font-bold text-sm leading-tight">
          {firstName} {lastName}
        </p>
      </div>
      <span
        className={
          isPrimary
            ? "shrink-0 rounded-md border border-primary/50 bg-primary/10 px-2.5 py-1 font-semibold text-primary text-xs"
            : "shrink-0 rounded-md border border-border px-2.5 py-1 font-medium text-muted-foreground text-xs"
        }
      >
        {isPrimary ? "Primary" : "Additional"}
      </span>
    </li>
  );
}

export default function Step4RegistrantReviewSection({
  memberLabel,
  memberName,
  otherParticipants,
  registrant,
}: Step4RegistrantReviewSectionProps) {
  const participantCount = 1 + (otherParticipants?.length ?? 0);

  return (
    <>
      <Card className="rounded-2xl border border-border/50 bg-background">
        <CardContent className="space-y-6 px-7 py-0">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Building2 className="h-5 w-5" />
            <span className="text-base uppercase tracking-wide">
              Registration Type
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Type
              </span>
              <span className="font-semibold text-base capitalize leading-tight">
                {memberLabel}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Organization
              </span>
              <span className="font-semibold text-base leading-tight">
                {memberName}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border/50 bg-background">
        <CardContent className="space-y-6 px-7 py-0">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Users className="h-5 w-5" />
            <span className="text-base uppercase tracking-wide">
              Participants ({participantCount})
            </span>
          </div>
          <ul className="space-y-3">
            <ParticipantCard
              firstName={registrant.firstName}
              isPrimary
              lastName={registrant.lastName}
            />
            {otherParticipants?.map((participant) => (
              <ParticipantCard
                firstName={participant.firstName}
                isPrimary={false}
                key={participant.id}
                lastName={participant.lastName}
              />
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
