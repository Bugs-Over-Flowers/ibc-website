"use client";

import { AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Tables } from "@/lib/supabase/db.types";
import { EventSlide } from "./hero/EventSlide";
import { FloatingParticles } from "./hero/FloatingParticle";
import { NoEventsFallback } from "./hero/NoEventsFallback";
import { WelcomeSection } from "./hero/WelcomeSection";

export type Event = Tables<"Event">;

interface HeroCarouselProps {
  events: Event[];
}

export function HeroCarousel({ events }: HeroCarouselProps) {
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const cycleCountRef = useRef(0);

  const upcomingEvents = events;
  const hasEvents = upcomingEvents.length > 0;

  const handleNavigate = useCallback(
    (page: string, params?: { eventId?: string }) => {
      if (page === "public-event-details" && params?.eventId) {
        window.location.href = `/events/${params.eventId}`;
      } else if (page === "public-events") {
        router.push("/events");
      }
    },
    [router],
  );

  useEffect(() => {
    if (showWelcome && !isPaused) {
      const welcomeTimer = setTimeout(() => {
        setShowWelcome(false);
        cycleCountRef.current = 0;
      }, 10000);
      return () => clearTimeout(welcomeTimer);
    }
  }, [showWelcome, isPaused]);

  useEffect(() => {
    if (!showWelcome && !hasEvents && !isPaused) {
      const fallbackTimer = setTimeout(() => {
        setShowWelcome(true);
      }, 10000);
      return () => clearTimeout(fallbackTimer);
    }
  }, [showWelcome, hasEvents, isPaused]);

  useEffect(() => {
    if (!showWelcome && hasEvents && !isPaused) {
      const eventTimer = setInterval(() => {
        setCurrentEventIndex((prev) => {
          const nextIndex = (prev + 1) % upcomingEvents.length;

          if (nextIndex === 0) {
            cycleCountRef.current += 1;

            if (cycleCountRef.current >= 1) {
              setTimeout(() => {
                setShowWelcome(true);
                setCurrentEventIndex(0);
                cycleCountRef.current = 0;
              }, 100);
              return prev;
            }
          }

          setDirection(1);
          return nextIndex;
        });
      }, 7000);
      return () => clearInterval(eventTimer);
    }
  }, [showWelcome, hasEvents, upcomingEvents.length, isPaused]);

  const nextEvent = useCallback(() => {
    if (upcomingEvents.length > 0) {
      setDirection(1);
      setCurrentEventIndex((prev) => (prev + 1) % upcomingEvents.length);
    }
  }, [upcomingEvents.length]);

  const prevEvent = useCallback(() => {
    if (upcomingEvents.length > 0) {
      setDirection(-1);
      setCurrentEventIndex(
        (prev) => (prev - 1 + upcomingEvents.length) % upcomingEvents.length,
      );
    }
  }, [upcomingEvents.length]);

  const goToEvent = useCallback(
    (index: number) => {
      setDirection(index > currentEventIndex ? 1 : -1);
      setCurrentEventIndex(index);
    },
    [currentEventIndex],
  );

  return (
    <section
      id="home"
      className="relative h-screen min-h-[700px] max-h-[950px] overflow-hidden"
    >
      <section
        aria-label="Hero carousel"
        className="absolute inset-0"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      />
      <FloatingParticles />

      <AnimatePresence mode="wait" custom={direction}>
        {showWelcome ? (
          <WelcomeSection key="welcome" onNavigate={handleNavigate} />
        ) : upcomingEvents.length > 0 ? (
          <EventSlide
            key={`event-${currentEventIndex}`}
            event={upcomingEvents[currentEventIndex]}
            direction={direction}
            currentIndex={currentEventIndex}
            totalEvents={upcomingEvents.length}
            isPaused={isPaused}
            onNavigate={handleNavigate}
            onPrev={prevEvent}
            onNext={nextEvent}
            onGoTo={goToEvent}
          />
        ) : (
          <NoEventsFallback key="no-events" onNavigate={handleNavigate} />
        )}
      </AnimatePresence>
    </section>
  );
}
