import { Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ParticipantCardProps {
  fullName: string;
  email: string;
  contactNumber: string;
  registrant?: boolean;
}
export default function ParticipantCard({
  fullName,
  email,
  contactNumber,
  registrant,
}: ParticipantCardProps) {
  const initials = fullName
    .split(" ")
    .map((namePart) => namePart[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
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
              <p className="mt-1 text-muted-foreground text-xs">Participant</p>
            </div>
          </div>
          {registrant ? (
            <Badge className="shrink-0" variant="secondary">
              Registrant
            </Badge>
          ) : null}
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
  );
}
