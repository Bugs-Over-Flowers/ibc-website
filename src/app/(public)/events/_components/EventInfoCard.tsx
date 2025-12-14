"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { Tables } from "@/lib/supabase/db.types";

type Event = Tables<"Event">;

import { Calendar, Clock, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";
import { formatDate, formatTime } from "@/lib/events/eventUtils";

interface EventInfoCardProps {
  event: Event;
}

export function EventInfoCard({ event }: EventInfoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isEventOngoing = (startDate: string | null, endDate: string | null) => {
    if (!startDate) return false;
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;
    return now >= start && now <= end;
  };
  const ongoing = isEventOngoing(event.eventStartDate, event.eventEndDate);

  return (
    <motion.div
      animate="visible"
      className="space-y-6 lg:col-span-3"
      initial="hidden"
      variants={staggerContainer}
    >
      {/* Title and Badge */}
      <motion.div variants={fadeInUp}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {ongoing && (
            <Badge className="border-0 bg-primary text-primary-foreground text-xs">
              <Sparkles className="mr-1 h-3 w-3" />
              Happening Now
            </Badge>
          )}
        </div>

        <h1 className="font-bold text-2xl text-foreground leading-tight sm:text-3xl md:text-4xl">
          {event.eventTitle}
        </h1>
      </motion.div>

      <motion.div className="flex flex-col gap-3" variants={fadeInUp}>
        {/* Location */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <MapPin className="h-5 w-5 text-primary" />
          <span className="text-foreground">{event.venue || "TBA"}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="text-foreground">
            {formatDate(event.eventStartDate)} -{" "}
            {formatDate(event.eventEndDate)}
          </span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <Clock className="h-5 w-5 text-primary" />
          <span className="text-foreground">
            {formatTime(event.eventStartDate, event.eventEndDate)}
          </span>
        </div>
      </motion.div>

      {/* Description */}
      <motion.div variants={fadeInUp}>
        <p
          className={`text-muted-foreground leading-relaxed ${
            !expanded && "line-clamp-4"
          }`}
        >
          {event.description || "No description available for this event."}
        </p>
        {event.description && event.description.length > 300 && (
          <Button
            className="mt-2 px-2 font-medium text-primary text-sm transition-colors hover:text-primary/80"
            onClick={() => setExpanded(!expanded)}
            size="sm"
            type="button"
            variant="ghost"
          >
            {expanded ? "Show Less" : "Read More"}
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
