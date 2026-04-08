"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Tables } from "@/lib/supabase/db.types";

type Event = Tables<"Event">;

interface EventDetailsHeroProps {
  event: Event;
}

export function EventDetailsHero({ event }: EventDetailsHeroProps) {
  return (
    <section className="relative pt-14 sm:pt-0">
      <div
        className="relative w-full overflow-hidden rounded-xl"
        style={{ aspectRatio: "4 / 1" }}
      >
        <motion.div
          animate={{ scale: 1 }}
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Image
            alt={event.eventTitle}
            className="object-contain"
            fill
            priority
            sizes="(max-width: 1600px) 100vw, 1600px"
            src={
              event.eventHeaderUrl ||
              "/placeholder.svg?height=600&width=1200&query=business+conference+event"
            }
          />
        </motion.div>

        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/20" />

        {/* Back button aligned to page content container (tablet/desktop) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 hidden sm:block md:bottom-8">
          <div className="mx-auto flex w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link className="pointer-events-auto" href="/events">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2.5 text-white shadow-lg backdrop-blur-xl transition-colors hover:bg-white/30"
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium text-sm">Back to Events</span>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile back button moved below hero so it never gets cramped by 4:1 height */}
      <div className="sm:hidden">
        <div className="mx-auto w-full max-w-7xl px-4 pt-3">
          <Link href="/events">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-foreground shadow-sm transition-colors hover:bg-accent"
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.4 }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium text-sm">Back to Events</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </section>
  );
}
