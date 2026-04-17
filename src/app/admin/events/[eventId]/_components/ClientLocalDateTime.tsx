"use client";

import { useEffect, useState } from "react";

type ClientLocalDateTimeProps = {
  isoString: string;
  fallback: string;
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const formatLocalDateTime = (isoString: string): string => {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  const parts = dateTimeFormatter.formatToParts(date);
  const valueByType = new Map(parts.map((part) => [part.type, part.value]));

  const month = valueByType.get("month");
  const day = valueByType.get("day");
  const year = valueByType.get("year");
  const hour = valueByType.get("hour");
  const minute = valueByType.get("minute");
  const dayPeriod = valueByType.get("dayPeriod");

  if (!month || !day || !year || !hour || !minute || !dayPeriod) {
    return dateTimeFormatter.format(date);
  }

  return `${month} ${day}, ${year} · ${hour}:${minute} ${dayPeriod}`;
};

export default function ClientLocalDateTime({
  isoString,
  fallback,
}: ClientLocalDateTimeProps) {
  const [formattedDateTime, setFormattedDateTime] = useState(fallback);

  useEffect(() => {
    setFormattedDateTime(formatLocalDateTime(isoString));
  }, [isoString]);

  return <>{formattedDateTime}</>;
}
