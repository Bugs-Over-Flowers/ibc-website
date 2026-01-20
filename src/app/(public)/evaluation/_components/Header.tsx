"use client";

import { motion } from "framer-motion";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";
import { formatDate } from "@/lib/events/eventUtils";
import type { Database } from "@/lib/supabase/db.types";

interface HeaderProps {
  event: Database["public"]["Tables"]["Event"]["Row"] | null;
}

export function Header({ event }: HeaderProps) {
  const formatTime = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <section className="relative flex min-h-[55vh] items-center overflow-hidden bg-linear-to-br from-primary/10 via-background to-primary/5 pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20">
      {/* Animated Blur Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.35, 0.2],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        className="absolute top-20 right-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px]"
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        animate={{
          scale: [1, 0.8, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        className="absolute bottom-10 left-10 h-[400px] w-[400px] rounded-full bg-primary/15 blur-[80px]"
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          animate="visible"
          className="flex flex-col items-center text-center"
          initial="hidden"
          variants={staggerContainer}
        >
          {/* Main Title */}
          <motion.h1
            className="w-full max-w-7xl font-bold text-3xl text-foreground tracking-tight sm:text-4xl lg:text-5xl"
            variants={fadeInUp}
          >
            Evaluation Form
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-3 max-w-2xl text-muted-foreground sm:text-lg"
            variants={fadeInUp}
          >
            The information you provide will help us in planning future events
            and activities more effectively. We truly appreciate you taking the
            time to fill out the form!
          </motion.p>

          {/* Event Details Card */}
          {event && (
            <motion.div
              className="mt-8 w-full max-w-5xl rounded-2xl border border-border bg-card/80 p-6 shadow-lg backdrop-blur-sm sm:p-8"
              variants={fadeInUp}
            >
              <h2 className="font-semibold text-foreground text-xl leading-tight sm:text-2xl">
                {event.eventTitle}
              </h2>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-muted-foreground text-sm sm:text-base">
                {event.eventEndDate && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
                    <span>{formatDate(event.eventEndDate)}</span>
                  </div>
                )}

                {event.eventEndDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0 text-primary" />
                    <span>{formatTime(event.eventEndDate)}</span>
                  </div>
                )}

                {event.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    <span>{event.venue}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
