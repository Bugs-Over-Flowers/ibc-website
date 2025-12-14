"use client";

import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import Image from "next/image";
// import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatDate,
  formatTime,
  getEventStatus,
} from "@/lib/events/eventUtils";
import type { Tables } from "@/lib/supabase/db.types";

type Event = Tables<"Event">;

import { fadeInUp } from "@/lib/animations/fade";

interface EventCardProps {
  event: Event;
}

import type { Route } from "next";
import { useRouter } from "next/navigation";

export function EventCard({ event }: EventCardProps) {
  const status = getEventStatus(event.eventStartDate, event.eventEndDate);
  const router = useRouter();

  // Handler to stop click bubbling for Register Now
  const handleRegisterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // TODO: Replace with actual registration logic or navigation
    router.push(`/registration/${event.eventId}/info`);
  };

  return (
    <motion.div
      className="group mx-auto flex h-full w-full max-w-[400px] rounded-xl"
      onClick={() => router.push(`/events/${event.eventId}` as Route)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          router.push(`/events/${event.eventId}` as Route);
        }
      }}
      role="button"
      style={{ cursor: "pointer" }}
      tabIndex={0}
      variants={fadeInUp}
    >
      <Card className="flex h-full min-h-[480px] w-full flex-col overflow-hidden rounded-2xl bg-white/80 py-0 shadow-lg ring-1 ring-border/50 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:ring-primary/20">
        {/* Image */}
        <div className="relative aspect-4/3 overflow-hidden">
          <Image
            alt={event.eventTitle}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            fill
            src={
              event.eventHeaderUrl ||
              "/placeholder.svg?height=300&width=400&query=business+event"
            }
          />
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            {status === "ongoing" && (
              <Badge className="bg-primary text-primary-foreground shadow-lg">
                <span className="relative mr-1.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                </span>
                Ongoing
              </Badge>
            )}
            {status === "upcoming" && (
              <Badge
                className="bg-destructive/90 text-white shadow-lg backdrop-blur-sm"
                variant="secondary"
              >
                Upcoming
              </Badge>
            )}
            {status === "past" && (
              <Badge
                className="border-muted bg-muted/80 text-muted-foreground shadow-lg backdrop-blur-sm"
                variant="outline"
              >
                Past Event
              </Badge>
            )}
          </div>
          {/* Registration Fee Badge */}
          <div className="absolute right-3 bottom-3">
            <Badge
              className={
                event.registrationFee === 0
                  ? "bg-primary/90 px-3 py-1 font-semibold text-primary-foreground text-xs shadow-md"
                  : "bg-muted/80 px-3 py-1 font-semibold text-foreground text-xs shadow-md"
              }
            >
              {event.registrationFee === 0
                ? "Free"
                : `Registration Fee: ₱${event.registrationFee.toLocaleString()}`}
            </Badge>
          </div>
        </div>
        <CardContent className="flex flex-1 flex-col p-5">
          {/* Title */}
          <h3 className="mb-2 line-clamp-2 font-bold text-foreground text-lg leading-tight transition-colors group-hover:text-primary">
            {event.eventTitle}
          </h3>
          {/* Description */}
          {event.description && (
            <p className="mb-4 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
              {event.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="mb-3 flex items-center gap-4 text-muted-foreground text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              {formatDate(event.eventStartDate)}
            </span>
          </div>

          <div className="mb-4 flex items-center gap-4 text-muted-foreground text-sm">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              {formatTime(event.eventStartDate, event.eventEndDate) ||
                "Time TBA"}
            </span>
          </div>
          {/* Action Buttons at Bottom */}
          <div className="mt-auto flex flex-col gap-2">
            {status !== "past" && (
              <Button
                className="w-full rounded-xl border-primary transition-all"
                onClick={handleRegisterClick}
                tabIndex={0}
                type="button"
                variant="default"
              >
                Register Now
              </Button>
            )}
            <Button
              className="bg w-full rounded-xl text-primary transition-all hover:text-primary-foreground"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/events/${event.eventId}`);
              }}
              tabIndex={0}
              type="button"
              variant="outline"
            >
              Read more
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
