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
    <section className="relative">
      {/* Hero Image - Fixed height, full width */}
      <div className="relative h-[500px] w-full overflow-hidden">
        <motion.div
          animate={{ scale: 1 }}
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Image
            alt={event.eventTitle}
            className="h-[500px] w-full object-cover"
            fill
            priority
            src={
              event.eventHeaderUrl ||
              "/placeholder.svg?height=600&width=1200&query=business+conference+event"
            }
          />
        </motion.div>

        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/20" />

        {/* Back button with glassmorphism - positioned at bottom center of hero */}
        <div className="absolute bottom-8 left-1/7 z-10 -translate-x-1/2 transform">
          <Link href="/events">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2.5 text-white shadow-lg backdrop-blur-xl transition-colors hover:bg-white/30"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
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
