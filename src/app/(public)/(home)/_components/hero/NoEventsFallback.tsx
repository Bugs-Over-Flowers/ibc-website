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
      animate={{ opacity: 1 }}
      className="absolute inset-0"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key="no-events"
      transition={{ duration: 1 }}
    >
      <Image
        alt="Business professionals networking"
        className="object-cover"
        fill
        priority
        src="/images/backgrounds/bg-2.jpg"
      />
      <div className="absolute inset-0 bg-linear-to-br from-foreground/95 via-foreground/80 to-primary/40" />
      <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-primary-foreground">
          <h2 className="mb-6 text-balance font-bold text-4xl sm:text-5xl">
            Stay Tuned for Upcoming Events
          </h2>
          <p className="mb-10 text-pretty text-lg text-primary-foreground/80 leading-relaxed sm:text-xl">
            New exciting events are coming soon. Check back regularly for
            updates on business networking opportunities.
          </p>
          <Button
            className="h-13 rounded-full bg-primary px-8 font-semibold text-base text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:shadow-primary/40 hover:shadow-xl"
            onClick={() => onNavigate("public-events")}
            size="lg"
          >
            Explore Past Events
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
