"use client";

import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

import { fadeInUp } from "@/components/animations/fade";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const status = getEventStatus(event.eventStartDate, event.eventEndDate);
  return (
    <motion.div
      variants={fadeInUp}
      className="group h-full flex w-full max-w-[400px] mx-auto"
    >
      <Link href={`/events/${event.eventId}`} className="flex-1" tabIndex={-1}>
        <Card className="bg-white/80 backdrop-blur-xl py-0 hover:cursor-pointer rounded-2xl shadow-lg ring-1 ring-border/50 overflow-hidden hover:shadow-xl hover:ring-primary/20 transition-all duration-300 flex flex-col h-full min-h-[480px] w-full">
          {/* Image */}
          <div className="relative aspect-4/3 overflow-hidden">
            <Image
              src={
                event.eventHeaderUrl ||
                "/placeholder.svg?height=300&width=400&query=business+event"
              }
              alt={event.eventTitle}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              {status === "ongoing" && (
                <Badge className="bg-primary text-primary-foreground shadow-lg">
                  <span className="relative flex h-2 w-2 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  Ongoing
                </Badge>
              )}
              {status === "upcoming" && (
                <Badge
                  variant="secondary"
                  className="bg-destructive/90 backdrop-blur-sm text-white shadow-lg"
                >
                  Upcoming
                </Badge>
              )}
              {status === "past" && (
                <Badge
                  variant="outline"
                  className="bg-muted/80 backdrop-blur-sm text-muted-foreground border-muted shadow-lg"
                >
                  Past Event
                </Badge>
              )}
            </div>
            {/* Registration Fee Badge */}
            <div className="absolute bottom-3 right-3">
              <Badge
                className={
                  event.registrationFee === 0
                    ? "bg-primary/90 text-primary-foreground shadow-md px-3 py-1 text-xs font-semibold"
                    : "bg-muted/80 text-foreground shadow-md px-3 py-1 text-xs font-semibold"
                }
              >
                {event.registrationFee === 0
                  ? "Free"
                  : `Registration Fee: ₱${event.registrationFee.toLocaleString()}`}
              </Badge>
            </div>
          </div>
          <CardContent className="p-5 flex flex-col flex-1">
            {/* Title */}
            <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
              {event.eventTitle}
            </h3>
            {/* Description */}
            {event.description && (
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                {event.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                {formatDate(event.eventStartDate)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                {formatTime(event.eventStartDate, event.eventEndDate) ||
                  "Time TBA"}
              </span>
            </div>
            {/* Action Buttons at Bottom */}
            <div className="flex flex-col gap-2 mt-auto">
              {status !== "past" && (
                <Button
                  asChild
                  variant="default"
                  className="w-full border-primary rounded-full transition-all pointer-events-none"
                >
                  <span>Register Now</span>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full transition-all bg-transparent pointer-events-none"
              >
                <span>Read more</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
