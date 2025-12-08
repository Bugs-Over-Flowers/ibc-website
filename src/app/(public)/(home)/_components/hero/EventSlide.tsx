"use client";

import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/lib/supabase/db.types";

export type Event = Tables<"Event">;
interface EventSlideProps {
  event: Event;
  direction: number;
  currentIndex: number;
  totalEvents: number;
  isPaused: boolean;
  onNavigate: (page: string, params?: { eventId?: string }) => void;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}

const DOT_IDS = Array.from({ length: 20 }, () => crypto.randomUUID());

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 1.05,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
    scale: 0.95,
  }),
};

const formatDateRange = (startDate: string | null, endDate: string | null) => {
  if (!startDate) return "TBA";
  const start = new Date(startDate);
  // Use UTC timezone to prevent hydration mismatches between server/client
  const startFormatted = start.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  if (!endDate || startDate === endDate) return startFormatted;

  const end = new Date(endDate);
  const endFormatted = end.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return `${startFormatted} - ${endFormatted}`;
};

export function EventSlide({
  event,
  direction,
  currentIndex,
  totalEvents,
  isPaused,
  onNavigate,
  onPrev,
  onNext,
  onGoTo,
}: EventSlideProps) {
  return (
    <motion.div
      key={`event-${event.eventId}`}
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
      className="absolute inset-0"
    >
      {/* Background Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 10, ease: "linear" }}
        className="absolute inset-0 w-full h-full"
      >
        <Image
          src={
            event.eventHeaderUrl ??
            "/placeholder.svg?height=1080&width=1920&query=business event conference"
          }
          alt={event.eventTitle}
          fill
          className="object-cover"
          priority={currentIndex === 0}
        />
      </motion.div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-linear-to-r from-foreground/95 via-foreground/70 to-foreground/20" />
      <div className="absolute inset-0 bg-linear-to-t from-foreground/70 via-transparent to-foreground/30" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Event Badge */}
          <motion.div
            className="inline-flex items-center gap-3 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="bg-primary/20 backdrop-blur-md text-primary px-5 py-2 rounded-full text-sm font-semibold border border-primary/30 tracking-wide">
              Upcoming Event
            </span>
          </motion.div>

          {/* Event Title */}
          <motion.h2
            className="text-primary-foreground text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-5 leading-tight text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {event.eventTitle}
          </motion.h2>

          {/* Event Description */}
          <motion.p
            className="text-primary-foreground/80 text-base sm:text-lg lg:text-xl mb-8 line-clamp-3 text-pretty leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {event.description || "Join us for this exciting event!"}
          </motion.p>

          {/* Event Details */}
          <motion.div
            className="flex flex-wrap gap-4 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-md rounded-xl px-5 py-3.5 border border-primary-foreground/10">
              <div className="bg-primary/20 p-2.5 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="text-primary-foreground">
                <p className="text-xs text-primary-foreground/60 font-medium">
                  Date
                </p>
                <p className="font-semibold text-sm">
                  {formatDateRange(event.eventStartDate, event.eventEndDate)}
                </p>
              </div>
            </div>
            {event.venue && (
              <div className="flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-md rounded-xl px-5 py-3.5 border border-primary-foreground/10">
                <div className="bg-primary/20 p-2.5 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="text-primary-foreground">
                  <p className="text-xs text-primary-foreground/60 font-medium">
                    Venue
                  </p>
                  <p className="font-semibold text-sm">{event.venue}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Button
              type="button"
              onClick={() =>
                onNavigate("public-event-details", { eventId: event.eventId })
              }
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 h-13 text-base font-semibold shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:scale-105"
            >
              View Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              type="button"
              onClick={() => onNavigate("public-events")}
              variant="outline"
              size="lg"
              className="rounded-full px-8 h-13 text-base font-semibold bg-primary-foreground/10 backdrop-blur-md border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:border-primary-foreground/50 transition-all duration-300 hover:scale-105"
            >
              See All Events
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Navigation Controls */}
      {totalEvents > 1 && (
        <>
          {/* Arrow Buttons */}
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 lg:w-14 lg:h-14 bg-primary-foreground/10 hover:bg-primary-foreground/20 backdrop-blur-md rounded-full border border-primary-foreground/20 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
            aria-label="Previous event"
          >
            <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-primary-foreground group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 lg:w-14 lg:h-14 bg-primary-foreground/10 hover:bg-primary-foreground/20 backdrop-blur-md rounded-full border border-primary-foreground/20 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
            aria-label="Next event"
          >
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-primary-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Progress Dots */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-3">
            {Array.from({ length: totalEvents }).map((_, index) => (
              <button
                type="button"
                key={DOT_IDS[index]}
                onClick={() => onGoTo(index)}
                className="group relative"
                aria-label={`Go to event ${index + 1}`}
              >
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary w-10"
                      : "bg-primary-foreground/30 hover:bg-primary-foreground/50 w-2.5"
                  }`}
                />
                {index === currentIndex && !isPaused && (
                  <motion.div
                    className="absolute inset-0 h-2.5 bg-primary/60 rounded-full origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 7, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Event Counter */}
          <div className="absolute bottom-10 right-8 z-10 bg-primary-foreground/10 backdrop-blur-md text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold border border-primary-foreground/20">
            <span className="text-primary">{currentIndex + 1}</span>
            <span className="text-primary-foreground/50"> / {totalEvents}</span>
          </div>
        </>
      )}
    </motion.div>
  );
}
