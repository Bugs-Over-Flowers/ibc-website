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
  fee: number;
};

export function RegistrationInfoEventCard({
  title,
  description,
  headerUrl,
  eventStartDate,
  eventEndDate,
  fee,
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
    <div className="overflow-hidden border-none shadow-md">
      {headerUrl && (
        <div className="relative h-64 w-full bg-muted/30 md:h-80">
          <Image alt={title} className="object-cover" fill src={headerUrl} />
        </div>
      )}

      <div className="p-8 md:p-10">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
          <CalendarDays className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold text-primary text-xs tracking-wide">
            {dateDisplay}
          </span>
        </div>

        <h1 className="mb-3 font-extrabold text-3xl text-foreground md:text-4xl">
          {title}
        </h1>

        {description && (
          <RichTextDisplay
            className="max-w-2xl text-muted-foreground text-sm md:text-base"
            content={description}
          />
        )}
        <p className="mt-4 text-muted-foreground">
          Registration fee:{" "}
          <span className="font-bold text-foreground">
            Php {fee.toLocaleString()}
          </span>{" "}
          per participant.
        </p>
      </div>
    </div>
  );
}
