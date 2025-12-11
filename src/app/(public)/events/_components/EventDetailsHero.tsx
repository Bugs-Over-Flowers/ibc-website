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
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Image
            src={
              event.eventHeaderUrl ||
              "/placeholder.svg?height=600&width=1200&query=business+conference+event"
            }
            alt={event.eventTitle}
            fill
            className="object-cover w-full h-[500px]"
            priority
          />
        </motion.div>

        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/20" />

        {/* Back button with glassmorphism - positioned at bottom center of hero */}
        <div className="absolute bottom-8 left-1/7 transform -translate-x-1/2 z-10">
          <Link href="/events">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 text-white hover:bg-white/30 transition-colors shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Events</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </section>
  );
}
