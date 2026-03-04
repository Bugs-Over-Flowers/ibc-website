import { formatDate } from "date-fns";
import { CalendarDays } from "lucide-react";
import Image from "next/image";
import RichTextDisplay from "@/components/RichTextDisplay";

type RegistrationInfoEventCardProps = {
  title: string;
  description: string | null;
  headerUrl: string | null;
  eventStartDate: string;
  eventEndDate: string;
};

export function RegistrationInfoEventCard({
  title,
  description,
  headerUrl,
  eventStartDate,
  eventEndDate,
}: RegistrationInfoEventCardProps) {
  const formattedStartDate = formatDate(
    new Date(eventStartDate),
    "dd MMM yyyy",
  );
  const formattedEndDate = formatDate(new Date(eventEndDate), "dd MMM yyyy");
  const dateDisplay =
    formattedStartDate === formattedEndDate
      ? formattedStartDate
      : `${formattedStartDate} – ${formattedEndDate}`;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {headerUrl && (
        <div className="relative h-52 w-full bg-muted/30 md:h-68">
          <Image alt={title} className="object-cover" fill src={headerUrl} />
          <div
            className="absolute inset-0"
            style={{ background: "var(--hero-overlay)" }}
          />
        </div>
      )}

      <div className="p-7 md:p-9">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1">
          <CalendarDays className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold text-primary text-xs tracking-wide">
            {dateDisplay}
          </span>
        </div>

        <h1 className="mb-3 text-foreground leading-tight">{title}</h1>

        {description && (
          <RichTextDisplay
            className="max-w-2xl text-muted-foreground text-sm"
            content={description}
          />
        )}
      </div>
    </div>
  );
}
