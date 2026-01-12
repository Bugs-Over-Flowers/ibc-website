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
      <div className="h-full">
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background transition-shadow hover:shadow-lg hover:shadow-primary/10">
          <Link
            className="group block flex-1"
            href={`/events/${event.eventId}`}
          >
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

              <div className="mt-2 h-10 overflow-hidden">
                <p className="line-clamp-2 text-muted-foreground text-sm">
                  {event.description}
                </p>
              </div>

              <div className="mt-4 flex-1"></div>

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
          </Link>

          <div className="flex flex-col gap-3 px-6 pb-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-primary">
                {event.registrationFee === 0
                  ? "Free"
                  : `₱${event.registrationFee.toLocaleString()}`}
              </span>
              {status !== "past" && (
                <Link
                  className="ml-auto flex w-auto items-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90 hover:text-white"
                  href={`/registration/${event.eventId}/info`}
                  onClick={(e) => e.stopPropagation()}
                  tabIndex={0}
                >
                  <ClipboardList className="h-4 w-4" />
                  Register Now
                </Link>
              )}
            </div>
            <Link
              className="group/readmore flex w-full items-center justify-center gap-2 rounded-xl border border-primary/50 bg-card px-4 py-2.5 font-medium text-primary text-sm transition-all duration-200 hover:border-primary hover:bg-primary/10 hover:shadow-md hover:shadow-primary/20"
              href={`/events/${event.eventId}`}
              onClick={(e) => e.stopPropagation()}
              tabIndex={0}
            >
              Read More
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/readmore:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
