import { Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  return (
    <Card
      className={cn(
        "transition-all hover:shadow-sm",
        registrant && "border-primary/50 bg-primary/5",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs",
                registrant
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-base">{fullName}</CardTitle>
              {registrant && (
                <p className="font-medium text-primary text-xs">Registrant</p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{email}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          <span>{contactNumber}</span>
        </div>
      </CardContent>
    </Card>
  );
}
