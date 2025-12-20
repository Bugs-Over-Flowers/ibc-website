import type { Tables } from "@/lib/supabase/db.types";

type Event = Tables<"Event">;

export type EventStatus = "upcoming" | "ongoing" | "past";

export const formatDate = (dateString: string | null) => {
  if (!dateString) return "TBA";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTime = (
  startDate: string | null,
  endDate: string | null,
) => {
  if (!startDate) return "TBA";
  const start = new Date(startDate);
  const timeStr = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  if (endDate) {
    const end = new Date(endDate);
    const endTimeStr = end.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${timeStr} - ${endTimeStr}`;
  }
  return timeStr;
};

export const getEventStatus = (
  startDate: string | null,
  endDate: string | null,
): EventStatus => {
  if (!startDate) return "upcoming";
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;

  end.setHours(23, 59, 59, 999);

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "past";
};

export const getEventCategory = (
  event: Event,
): "ongoing" | "upcoming" | "past" => {
  if (!event.eventStartDate) return "upcoming";
  const now = new Date();
  const start = new Date(event.eventStartDate);
  const end = event.eventEndDate
    ? new Date(event.eventEndDate)
    : new Date(start);
  end.setHours(23, 59, 59, 999);

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "past";
};
