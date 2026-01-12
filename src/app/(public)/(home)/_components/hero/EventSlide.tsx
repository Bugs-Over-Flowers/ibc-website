"use client";

import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
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
    scale: 1.02,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
    scale: 0.98,
  }),
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const formatDateRange = (startDate: string | null, endDate: string | null) => {
  if (!startDate) return "TBA";
  const start = new Date(startDate);
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
      animate="center"
      className="absolute inset-0"
      custom={direction}
      exit="exit"
      initial="enter"
      key={`event-${event.eventId}`}
      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
      variants={slideVariants}
    >
      {/* Background Image */}
      <motion.div
        animate={{ scale: 1.03 }}
        className="absolute inset-0 h-full w-full"
        initial={{ scale: 1 }}
        transition={{ duration: 15, ease: "linear" }}
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

      {/* Multi-layer Gradient Overlay for consistent contrast */}
      <div className="absolute inset-0 bg-linear-to-r from-slate-900/90 via-slate-900/60 to-slate-900/30" />
      <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-slate-900/40" />

      {/* Content */}
      <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <motion.div
          animate="visible"
          className="w-full max-w-3xl"
          initial="hidden"
          variants={contentVariants}
        >
          {/* Event Badge */}
          <motion.div
            className="mb-5 inline-flex items-center gap-3"
            variants={itemVariants}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 font-medium text-emerald-300 text-sm tracking-wide backdrop-blur-sm">
              Upcoming Event
            </span>
          </motion.div>

          {/* Event Title */}
          <motion.h2
            className="mb-4 line-clamp-2 text-balance font-bold text-3xl text-white leading-tight sm:text-4xl lg:text-5xl"
            variants={itemVariants}
          >
            {event.eventTitle}
          </motion.h2>

          {/* Event Description */}
          <motion.p
            className="mb-6 line-clamp-2 max-w-2xl text-pretty text-base text-white/80 leading-relaxed sm:text-lg"
            variants={itemVariants}
          >
            {event.description ||
              "Join us for this exciting business networking event!"}
          </motion.p>

          {/* Event Details Pills */}
          <motion.div
            className="mb-8 flex flex-wrap gap-3"
            variants={itemVariants}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm text-white/90">
                {formatDateRange(event.eventStartDate, event.eventEndDate)}
              </span>
            </div>
            {event.venue && (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="line-clamp-1 max-w-[200px] font-medium text-sm text-white/90">
                  {event.venue}
                </span>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div className="flex flex-wrap gap-3" variants={itemVariants}>
            <Button
              className="h-11 rounded-full bg-primary px-6 font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] hover:bg-primary/90 hover:shadow-primary/30 hover:shadow-xl"
              onClick={() =>
                onNavigate("public-event-details", { eventId: event.eventId })
              }
              size="lg"
              type="button"
            >
              View Event Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              className="h-11 rounded-full border-2 border-white/25 bg-white/5 px-6 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-white/40 hover:bg-white/10"
              onClick={() => onNavigate("public-events")}
              size="lg"
              type="button"
              variant="outline"
            >
              Browse All Events
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
            className="group absolute top-1/2 left-4 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white/40 hover:bg-white/15 lg:left-6 lg:h-12 lg:w-12"
            onClick={onPrev}
            type="button"
          >
            <ChevronLeft className="h-5 w-5 text-white transition-transform group-hover:-translate-x-0.5" />
          </button>
          <button
            aria-label="Next event"
            className="group absolute top-1/2 right-4 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white/40 hover:bg-white/15 lg:right-6 lg:h-12 lg:w-12"
            onClick={onNext}
            type="button"
          >
            <ChevronRight className="h-5 w-5 text-white transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Progress Dots */}
          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            {Array.from({ length: totalEvents }).map((_, index) => (
              <button
                aria-label={`Go to event ${index + 1}`}
                className="group relative p-1"
                key={DOT_IDS[index]}
                onClick={() => onGoTo(index)}
                type="button"
              >
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-white/30 group-hover:bg-white/50"
                  }`}
                />
                {index === currentIndex && !isPaused && (
                  <motion.div
                    animate={{ scaleX: 1 }}
                    className="absolute inset-y-1 right-1 left-1 h-2 origin-left rounded-full bg-primary/60"
                    initial={{ scaleX: 0 }}
                    transition={{ duration: 7, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Event Counter */}
          <div className="absolute right-6 bottom-8 z-10 hidden rounded-full border border-white/20 bg-white/5 px-4 py-2 font-medium text-sm backdrop-blur-md sm:block">
            <span className="text-primary">{currentIndex + 1}</span>
            <span className="text-white/50"> / {totalEvents}</span>
          </div>
        </>
      )}
    </motion.div>
  );
}
