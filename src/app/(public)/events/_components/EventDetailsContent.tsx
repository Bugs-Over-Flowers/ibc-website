"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Tables } from "@/lib/supabase/db.types";

type Event = Tables<"Event">;

import { ExternalLink, MessageSquare } from "lucide-react";
import type { Route } from "next";
import { FacebookIcon } from "@/components/icons/SocialIcons";
import { Button } from "@/components/ui/button";
import { staggerContainer } from "@/lib/animations/stagger";
import { getEventStatus } from "@/lib/events/eventUtils";
import { EventInfoCard } from "./EventInfoCard";
import EventRegistrationCard from "./EventRegistrationCard";

interface EventDetailsContentProps {
  event: Event;
}

export function EventDetailsContent({ event }: EventDetailsContentProps) {
  const router = useRouter();
  const status = getEventStatus(event.eventStartDate, event.eventEndDate);
  const facebookLink = event.facebookLink?.trim() ?? "";

  const handleEvaluationClick = () => {
    router.push(`/evaluation?eventId=${event.eventId}` as Route);
  };

  return (
    <section className="relative overflow-hidden bg-background py-6 sm:py-8 md:py-12">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-5 lg:gap-12">
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
            <div className="flex flex-col justify-end gap-3 lg:col-span-2">
              <Button
                className="h-12 w-full rounded-2xl border-border bg-transparent text-foreground hover:bg-accent"
                onClick={handleEvaluationClick}
                size="lg"
                variant="outline"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Submit Feedback
              </Button>

              {facebookLink && (
                <a
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-foreground transition-colors hover:border-primary/30 hover:bg-accent"
                  href={facebookLink}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <FacebookIcon className="h-5 w-5 text-[#1877F2]" />
                  <span className="flex-1 font-medium">
                    Event Facebook Link
                  </span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
