"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { slideVariants } from "@/lib/animations/slide";
import { formatDate } from "@/lib/events/eventUtils";
import type { Tables } from "@/lib/supabase/db.types";

interface FeaturedEventListProps {
  events: Tables<"Event">[];
}

export function FeaturedEventList({ events }: FeaturedEventListProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const hasMultipleEvents = events.length > 1;
  const currentEvent = events[currentIndex];

  const paginate = useCallback(
    (newDirection: number) => {
      setDirection(newDirection);
      setCurrentIndex((prev) => {
        let next = prev + newDirection;
        if (next < 0) next = events.length - 1;
        if (next >= events.length) next = 0;
        return next;
      });
    },
    [events.length],
  );

  useEffect(() => {
    if (!hasMultipleEvents || isPaused) return;

    const interval = setInterval(() => {
      paginate(1);
    }, 6000);

    return () => clearInterval(interval);
  }, [hasMultipleEvents, isPaused, paginate]);

  if (!currentEvent) return null;

  const handlePrev = () => paginate(-1);
  const handleNext = () => paginate(1);
  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mb-16"
      initial={{ opacity: 0, y: 30 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/5 via-accent/5 to-transparent p-6 md:p-8">
        <AnimatePresence custom={direction} initial={false} mode="wait">
          <motion.div
            animate="center"
            className="flex flex-col items-center gap-8 lg:flex-row"
            custom={direction}
            exit="exit"
            initial="enter"
            key={currentIndex}
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            variants={slideVariants}
          >
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl shadow-xl lg:w-1/2">
              <Image
                alt={currentEvent.eventTitle}
                className="object-cover"
                fill
                src={
                  currentEvent.eventHeaderUrl ||
                  "/placeholder.svg?height=400&width=600&query=business+conference+event"
                }
              />
            </div>

            <div className="w-full flex-1 lg:w-1/2">
              <div className="mb-4 flex items-center gap-3">
                <Badge className="bg-primary text-primary-foreground shadow-lg">
                  <span className="relative mr-1.5 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                  Happening Now
                </Badge>
                <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  {formatDate(currentEvent.eventStartDate)}
                </span>
              </div>

              <h2 className="mb-4 font-bold text-2xl text-foreground leading-tight md:text-3xl lg:text-4xl">
                {currentEvent.eventTitle}
              </h2>

              {currentEvent.description && (
                <p className="mb-6 line-clamp-3 text-base text-muted-foreground leading-relaxed md:text-lg">
                  {currentEvent.description}
                </p>
              )}

              <div className="mb-6 flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{currentEvent.venue || "Venue TBA"}</span>
              </div>

              <div className="flex gap-4">
                <Button
                  className="rounded-full bg-foreground px-8 text-background hover:bg-foreground/90"
                  nativeButton={false}
                  render={
                    <Link href={`/events/${currentEvent.eventId}`}>
                      View Event
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  }
                  size="lg"
                />
                <Button
                  className="rounded-full px-8"
                  nativeButton={false}
                  render={
                    <Link href={`/registration/${currentEvent.eventId}/info`}>
                      Register Now
                    </Link>
                  }
                  size="lg"
                  variant="outline"
                ></Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {hasMultipleEvents && (
          <>
            <button
              aria-label="Previous event"
              className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white md:left-4"
              onClick={handlePrev}
              type="button"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              aria-label="Next event"
              className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white md:right-4"
              onClick={handleNext}
              type="button"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>

            <div className="mt-6 flex justify-center gap-2">
              {events.map((event, index) => (
                <button
                  aria-label={`Go to event ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  key={`event-dot-${event.eventId}`}
                  onClick={() => handleDotClick(index)}
                  type="button"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
