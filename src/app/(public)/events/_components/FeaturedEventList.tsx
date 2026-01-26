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
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { slideVariants } from "@/lib/animations/slide";
import { formatDate } from "@/lib/events/eventUtils";
import type { Tables } from "@/lib/supabase/db.types";

interface FeaturedEventListProps {
  events: Tables<"Event">[];
}

export function FeaturedEventList({ events }: FeaturedEventListProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);

  const hasMultiple = events.length > 1;

  const currentEvent = useMemo(() => events[index], [events, index]);

  const paginate = useCallback(
    (dir: 1 | -1) => {
      setDirection(dir);
      setIndex((prev) => {
        const next = prev + dir;
        if (next < 0) return events.length - 1;
        if (next >= events.length) return 0;
        return next;
      });
    },
    [events.length],
  );

  useEffect(() => {
    if (!hasMultiple || paused) return;
    const id = setInterval(() => paginate(1), 6000);
    return () => clearInterval(id);
  }, [hasMultiple, paused, paginate]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (!currentEvent) return null;

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      aria-live="polite"
      className="mb-16"
      initial={{ opacity: 0, y: 30 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8">
        <AnimatePresence custom={direction} initial={false} mode="wait">
          <motion.div
            animate="center"
            className="flex flex-col items-center gap-8 lg:flex-row"
            custom={direction}
            exit="exit"
            initial="enter"
            key={currentEvent.eventId}
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            variants={slideVariants}
          >
            {/* Image */}
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl shadow-xl lg:w-1/2">
              <Image
                alt={currentEvent.eventTitle}
                className="object-cover"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                src={
                  currentEvent.eventHeaderUrl ||
                  "/placeholder.svg?height=400&width=600"
                }
              />
            </div>

            {/* Content */}
            <div className="w-full flex-1 lg:w-1/2">
              <div className="mb-4 flex items-center gap-3">
                <Badge className="bg-primary text-primary-foreground shadow-lg">
                  <span className="relative mr-1.5 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative h-2 w-2 rounded-full bg-white" />
                  </span>
                  Happening Now
                </Badge>

                <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  {formatDate(currentEvent.eventStartDate)}
                </span>
              </div>

              <h2 className="mb-4 font-bold text-2xl md:text-3xl lg:text-4xl">
                {currentEvent.eventTitle}
              </h2>

              {currentEvent.description && (
                <p className="mb-6 line-clamp-3 text-muted-foreground md:text-lg">
                  {currentEvent.description}
                </p>
              )}

              <div className="mb-6 flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{currentEvent.venue || "Venue TBA"}</span>
              </div>

              <div className="flex gap-4">
                <Link
                  className="inline-flex h-12 items-center rounded-lg bg-primary px-8 text-primary-foreground transition hover:bg-primary/90"
                  href={{
                    pathname: `/events/${currentEvent.eventId}`,
                  }}
                >
                  View Event
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                {currentEvent.maxGuest > 0 &&
                currentEvent.availableSlots <= 0 ? (
                  <Button
                    className="inline-flex h-12 items-center justify-center rounded-lg border border-input bg-muted px-8 text-muted-foreground transition hover:bg-muted"
                    disabled
                    variant="outline"
                  >
                    Event Full
                  </Button>
                ) : (
                  <Link
                    className="inline-flex h-12 items-center justify-center rounded-lg border border-primary px-8 text-primary transition hover:bg-primary/5"
                    href={`/registration/${currentEvent.eventId}/info`}
                  >
                    Register Now
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {hasMultiple && (
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <Button
              aria-label="Previous event"
              onClick={() => paginate(-1)}
              size="icon"
              variant="ghost"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              aria-label="Next event"
              onClick={() => paginate(1)}
              size="icon"
              variant="ghost"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </motion.section>
  );
}
