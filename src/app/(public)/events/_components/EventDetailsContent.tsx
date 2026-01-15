"use client";

import { motion } from "framer-motion";
import type { Tables } from "@/lib/supabase/db.types";

type Event = Tables<"Event">;

import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { staggerContainer } from "@/lib/animations/stagger";
import { getEventStatus } from "@/lib/events/eventUtils";
import { EventInfoCard } from "./EventInfoCard";
import EventRegistrationCard from "./EventRegistrationCard";

interface EventDetailsContentProps {
  event: Event;
}

export function EventDetailsContent({ event }: EventDetailsContentProps) {
  const status = getEventStatus(event.eventStartDate, event.eventEndDate);

  return (
    <section className="relative overflow-hidden bg-background py-8 md:py-12">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
          <motion.div
            animate="visible"
            className="flex flex-col lg:col-span-3"
            initial="hidden"
            variants={staggerContainer}
          >
            <EventInfoCard event={event} />
          </motion.div>
          {status !== "past" ? (
            <motion.div
              animate="visible"
              className="flex flex-col lg:col-span-2"
              initial="hidden"
              variants={staggerContainer}
            >
              <EventRegistrationCard event={event} />
            </motion.div>
          ) : (
            <div className="flex flex-col justify-end lg:col-span-2">
              <Button
                className="h-12 w-full rounded-2xl border-border bg-transparent text-foreground hover:bg-accent"
                size="lg"
                variant="outline"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Submit Feedback
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
