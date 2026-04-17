import { formatInTimeZone } from "date-fns-tz";

type EventScheduleDateTimeProps = {
  isoString: string;
  timeZone: string;
};

const formatEventDateTime = (isoString: string, timeZone: string): string => {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return formatInTimeZone(date, timeZone, "MMM d, yyyy · hh:mm a");
};

export default function EventScheduleDateTime({
  isoString,
  timeZone,
}: EventScheduleDateTimeProps) {
  return <>{formatEventDateTime(isoString, timeZone)}</>;
}
