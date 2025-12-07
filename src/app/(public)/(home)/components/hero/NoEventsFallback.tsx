"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface NoEventsFallbackProps {
  onNavigate: (page: string) => void;
}

export function NoEventsFallback({ onNavigate }: NoEventsFallbackProps) {
  return (
    <motion.div
      key="no-events"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0"
    >
      <Image
        src="/images/backgrounds/bg-2.jpg"
        alt="Business professionals networking"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-linear-to-br from-foreground/95 via-foreground/80 to-primary/40" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="text-primary-foreground max-w-2xl">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-balance">
            Stay Tuned for Upcoming Events
          </h2>
          <p className="text-lg sm:text-xl text-primary-foreground/80 mb-10 text-pretty leading-relaxed">
            New exciting events are coming soon. Check back regularly for
            updates on business networking opportunities.
          </p>
          <Button
            onClick={() => onNavigate("public-events")}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 h-13 text-base font-semibold shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:scale-105"
          >
            Explore Past Events
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
