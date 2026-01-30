import { Label } from "@/components/ui/label";

interface InterviewDetailsCardProps {
  interviewDate: Date | undefined;
  interviewVenue: string;
}

export function InterviewDetailsCard({
  interviewDate,
  interviewVenue,
}: InterviewDetailsCardProps) {
  const formattedDate = interviewDate
    ? new Intl.DateTimeFormat("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(interviewDate)
    : "Not set";

  return (
    <div className="grid gap-4 rounded-md border p-4">
      <div>
        <Label className="text-muted-foreground text-xs">Date & Time</Label>
        <p className="mt-1 text-sm">{formattedDate}</p>
      </div>
      <div>
        <Label className="text-muted-foreground text-xs">Venue</Label>
        <p className="mt-1 text-sm">{interviewVenue || "Not set"}</p>
      </div>
    </div>
  );
}
