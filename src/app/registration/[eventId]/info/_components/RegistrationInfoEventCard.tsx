import { formatDate } from "date-fns";
import { CalendarDays, CircleDollarSign } from "lucide-react";
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
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-black/5 shadow-xl">
      {headerUrl && (
        <div
          className="relative w-full overflow-hidden rounded-xl bg-muted/30"
          style={{ aspectRatio: "4 / 1" }}
        >
          <Image
            alt={title}
            className="object-contain"
            fill
            priority
            sizes="(max-width: 1600px) 100vw, 1600px"
            src={headerUrl}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/25 via-black/5 to-transparent" />
        </div>
      )}

      <div className="space-y-6 p-7 md:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span className="font-semibold text-primary text-xs tracking-wide md:text-sm">
            {dateDisplay}
          </span>
        </div>

        <h1 className="max-w-4xl font-extrabold text-3xl text-foreground leading-tight md:text-4xl">
          {title}
        </h1>

        {description && (
          <RichTextDisplay
            className="max-w-3xl text-muted-foreground text-sm leading-relaxed md:text-base"
            content={description}
          />
        )}

        <div className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary/12 via-primary/8 to-primary/5 p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 font-semibold text-foreground text-sm md:text-base">
                <CircleDollarSign className="h-4 w-4 text-primary" />
                Registration Fee
              </p>
              <p className="mt-1 text-muted-foreground text-xs md:text-sm">
                Charged per participant
              </p>
            </div>

            <div className="text-right">
              <p className="font-extrabold text-2xl text-foreground tracking-tight md:text-3xl">
                ₱ {fee.toLocaleString()}
              </p>
              <p className="text-muted-foreground text-xs md:text-sm">
                / person
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
