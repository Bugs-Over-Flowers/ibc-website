"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, ClipboardList, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getStatusBadge } from "@/components/BadgeEvents";
import {
  formatDate,
  formatTime,
  getEventStatus,
} from "@/lib/events/eventUtils";
import type { Tables } from "@/lib/supabase/db.types";

type Event = Tables<"Event">;

interface EventCardProps {
  event: Event;
  index: number;
}

export function EventCard({ event, index }: EventCardProps) {
  const status = getEventStatus(event.eventStartDate, event.eventEndDate);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
    >
      <div className="relative h-full">
        {/* Card clickable overlay */}
        <Link
          aria-label={`View details for ${event.eventTitle}`}
          className="absolute inset-0 z-10"
          href={`/events/${event.eventId}`}
        />

        <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-background text-left transition-all hover:shadow-lg hover:shadow-primary/10">
          <div className="flex-1">
            <div className="relative aspect-16/10 overflow-hidden">
              <Image
                alt={event.eventTitle}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                fill
                src={event.eventHeaderUrl || "/placeholder.svg"}
              />
              <div className="absolute top-4 left-4 flex gap-2">
                {getStatusBadge(status)}
              </div>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div className="h-14 overflow-hidden">
                <h3 className="line-clamp-2 font-semibold text-foreground text-lg transition-colors group-hover:text-primary">
                  {event.eventTitle}
                </h3>
              </div>
              <div className="space-y-2 border-border border-t pt-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{formatDate(event.eventStartDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <svg
                    aria-label="Event time"
                    className="h-4 w-4 text-primary"
                    fill="none"
                    role="img"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <title>Event time</title>
                    <path
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>
                    {formatTime
                      ? formatTime(event.eventStartDate, event.eventEndDate) ||
                        "Time TBA"
                      : "Time TBA"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="truncate">{event.venue || "Venue TBA"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-6 pb-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-primary">
                {event.registrationFee === 0
                  ? "Free"
                  : Math.trunc(event.registrationFee) > 999999
                    ? "₱999,999+"
                    : `₱${Math.trunc(event.registrationFee).toLocaleString()}`}
              </span>
              {status !== "past" && (
                <Link
                  className="relative z-20 ml-auto inline-flex w-auto items-center gap-2 rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground text-sm shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  href={`/registration/${event.eventId}/info`}
                >
                  <ClipboardList className="h-4 w-4" />
                  Register Now
                </Link>
              )}
            </div>
            <span className="group/readmore relative z-20 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 font-semibold text-foreground text-sm shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
              Read More
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/readmore:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
