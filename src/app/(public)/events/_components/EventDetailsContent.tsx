"use client";

import { motion } from "framer-motion";
import type { Tables } from "@/lib/supabase/db.types";

type Event = Tables<"Event">;

import { staggerContainer } from "@/components/animations/stagger";
import { getEventStatus } from "@/lib/events/eventUtils";
import { EventInfoCard } from "./EventInfoCard";
import EventRegistrationCard from "./EventRegistrationCard";

interface EventDetailsContentProps {
  event: Event;
}

export function EventDetailsContent({ event }: EventDetailsContentProps) {
  const status = getEventStatus(event.eventStartDate, event.eventEndDate);

  return (
    <section className="py-8 md:py-12 relative overflow-hidden bg-background">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-3 flex flex-col"
          >
            <EventInfoCard event={event} />
          </motion.div>
          {status !== "past" && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="lg:col-span-2 flex flex-col"
            >
              <EventRegistrationCard event={event} />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
