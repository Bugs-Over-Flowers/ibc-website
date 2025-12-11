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
import { slideVariants } from "@/components/animations/slide";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mb-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="bg-linear-to-br from-primary/5 via-accent/5 to-transparent rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="flex flex-col lg:flex-row gap-8 items-center"
          >
            <div className="relative w-full lg:w-1/2 aspect-4/3 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={
                  currentEvent.eventHeaderUrl ||
                  "/placeholder.svg?height=400&width=600&query=business+conference+event"
                }
                alt={currentEvent.eventTitle}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 w-full lg:w-1/2">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-primary text-primary-foreground shadow-lg">
                  <span className="relative flex h-2 w-2 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  Happening Now
                </Badge>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {formatDate(currentEvent.eventStartDate)}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
                {currentEvent.eventTitle}
              </h2>

              {currentEvent.description && (
                <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-3 text-base md:text-lg">
                  {currentEvent.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{currentEvent.venue || "Venue TBA"}</span>
              </div>

              <div className="flex gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-foreground hover:bg-foreground/90 text-background rounded-full px-8"
                >
                  <Link href={`/events/${currentEvent.eventId}`}>
                    View Event
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8"
                >
                  Register Now
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {hasMultipleEvents && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-lg transition-all"
              aria-label="Previous event"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-lg transition-all"
              aria-label="Next event"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>

            <div className="flex justify-center gap-2 mt-6">
              {events.map((event, index) => (
                <button
                  type="button"
                  key={`event-dot-${event.eventId}`}
                  onClick={() => handleDotClick(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to event ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
