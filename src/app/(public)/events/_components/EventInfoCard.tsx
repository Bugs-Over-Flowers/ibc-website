"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { Tables } from "@/lib/supabase/db.types";

type Event = Tables<"Event">;

import { Calendar, Clock, MapPin, Sparkles } from "lucide-react";
import { fadeInUp } from "@/components/animations/fade";
import { staggerContainer } from "@/components/animations/stagger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="lg:col-span-3 space-y-6"
    >
      {/* Title and Badge */}
      <motion.div variants={fadeInUp}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {ongoing && (
            <Badge className="bg-primary text-primary-foreground border-0 text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Happening Now
            </Badge>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
          {event.eventTitle}
        </h1>
      </motion.div>

      <motion.div variants={fadeInUp} className="flex flex-col gap-3">
        {/* Location */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="text-foreground">{event.venue || "TBA"}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="text-foreground">
            {formatDate(event.eventStartDate)} -{" "}
            {formatDate(event.eventEndDate)}
          </span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <Clock className="w-5 h-5 text-primary" />
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
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-primary hover:text-primary/80 font-medium text-sm mt-2 transition-colors px-2"
          >
            {expanded ? "Show Less" : "Read More"}
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
