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

function _truncate(str: string, max: number) {
  if (!str) return "";
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}

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
      animate="center"
      className="absolute inset-0"
      custom={direction}
      exit="exit"
      initial="enter"
      key={`event-${event.eventId}`}
      transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
      variants={slideVariants}
    >
      {/* Background Image */}
      <motion.div
        animate={{ opacity: 1 }}
        className="absolute inset-0 h-full w-full"
        initial={{ opacity: 0 }}
        transition={{ duration: 10, ease: "linear" }}
      >
        <Image
          alt={event.eventTitle}
          className="object-cover"
          fill
          priority={currentIndex === 0}
          src={
            event.eventHeaderUrl ??
            "/placeholder.svg?height=1080&width=1920&query=business event conference"
          }
        />
      </motion.div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-linear-to-r from-foreground/75 via-foreground/50 to-foreground/20" />
      <div className="absolute inset-0 bg-linear-to-t from-foreground/70 via-transparent to-foreground/30" />

      {/* Content */}
      <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-5xl text-left md:max-w-6xl md:text-left lg:max-w-7xl xl:max-w-[90vw]"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Event Badge */}
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 inline-flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
            </span>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-5 py-2 font-semibold text-primary text-sm tracking-wide backdrop-blur-md">
              Upcoming Event
            </span>
          </motion.div>

          {/* Event Title */}
          <motion.h2
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 line-clamp-2 text-balance font-bold text-primary-foreground text-xl leading-tight sm:text-3xl lg:text-4xl xl:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            style={{ wordBreak: "break-word", hyphens: "auto" }}
            title={event.eventTitle}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {event.eventTitle}
          </motion.h2>

          {/* Event Description */}
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 line-clamp-3 text-pretty text-primary-foreground/80 text-sm leading-relaxed sm:text-base lg:text-lg xl:text-xl"
            initial={{ opacity: 0, y: 20 }}
            style={{ wordBreak: "break-word", hyphens: "auto" }}
            title={event.description || "Join us for this exciting event!"}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {event.description || "Join us for this exciting event!"}
          </motion.p>

          {/* Event Details */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center gap-3 rounded-xl border border-primary-foreground/10 bg-primary-foreground/10 px-5 py-3.5 backdrop-blur-md">
              <div className="rounded-lg bg-primary/20 p-2.5">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="text-primary-foreground">
                <p className="font-medium text-primary-foreground/60 text-xs">
                  Date
                </p>
                <p className="font-semibold text-sm">
                  {formatDateRange(event.eventStartDate, event.eventEndDate)}
                </p>
              </div>
            </div>
            {event.venue && (
              <div className="flex items-center gap-3 rounded-xl border border-primary-foreground/10 bg-primary-foreground/10 px-5 py-3.5 backdrop-blur-md">
                <div className="rounded-lg bg-primary/20 p-2.5">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="text-primary-foreground">
                  <p className="font-medium text-primary-foreground/60 text-xs">
                    Venue
                  </p>
                  <p className="font-semibold text-sm">{event.venue}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Button
              className="h-13 rounded-full bg-primary px-8 font-semibold text-base text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:shadow-primary/40 hover:shadow-xl"
              onClick={() =>
                onNavigate("public-event-details", { eventId: event.eventId })
              }
              size="lg"
              type="button"
            >
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              className="h-13 rounded-full border-primary-foreground/30 bg-primary-foreground/10 px-8 font-semibold text-base text-primary-foreground backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-primary-foreground/50 hover:bg-primary-foreground/20 hover:text-none"
              onClick={() => onNavigate("public-events")}
              size="lg"
              type="button"
              variant="outline"
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
            aria-label="Previous event"
            className="group absolute top-1/2 left-4 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-primary-foreground/20 lg:left-8 lg:h-14 lg:w-14"
            onClick={onPrev}
            type="button"
          >
            <ChevronLeft className="h-5 w-5 text-primary-foreground transition-transform group-hover:-translate-x-0.5 lg:h-6 lg:w-6" />
          </button>
          <button
            aria-label="Next event"
            className="group absolute top-1/2 right-4 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-primary-foreground/20 lg:right-8 lg:h-14 lg:w-14"
            onClick={onNext}
            type="button"
          >
            <ChevronRight className="h-5 w-5 text-primary-foreground transition-transform group-hover:translate-x-0.5 lg:h-6 lg:w-6" />
          </button>

          {/* Progress Dots */}
          <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 gap-3">
            {Array.from({ length: totalEvents }).map((_, index) => (
              <button
                aria-label={`Go to event ${index + 1}`}
                className="group relative"
                key={DOT_IDS[index]}
                onClick={() => onGoTo(index)}
                type="button"
              >
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-10 bg-primary"
                      : "w-2.5 bg-primary-foreground/30 hover:bg-primary-foreground/50"
                  }`}
                />
                {index === currentIndex && !isPaused && (
                  <motion.div
                    animate={{ scaleX: 1 }}
                    className="absolute inset-0 h-2.5 origin-left rounded-full bg-primary/60"
                    initial={{ scaleX: 0 }}
                    transition={{ duration: 7, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Event Counter */}
          <div className="absolute right-8 bottom-10 z-10 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-5 py-2.5 font-semibold text-primary-foreground text-sm backdrop-blur-md">
            <span className="text-primary">{currentIndex + 1}</span>
            <span className="text-primary-foreground/50"> / {totalEvents}</span>
          </div>
        </>
      )}
    </motion.div>
  );
}
