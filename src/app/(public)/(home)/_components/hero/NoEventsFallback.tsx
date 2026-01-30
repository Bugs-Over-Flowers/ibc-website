"use client";

import { ArrowRight, Bell, CalendarDays } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NoEventsFallbackProps {
  onNavigate: (page: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

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
      {/* Background Image with Ken Burns effect */}
      <motion.div
        animate={{ scale: 1.08 }}
        className="absolute inset-0 h-full w-full"
        initial={{ scale: 1 }}
        transition={{ duration: 25, ease: "linear" }}
      >
        <Image
          alt="Iloilo Business Club networking event"
          className="object-cover brightness-100 dark:brightness-75 dark:contrast-110 dark:saturate-90"
          fill
          priority
          src="/images/backgrounds/bg-2.jpg"
        />
      </motion.div>

      {/* Hero Overlay with contrast-safe tokens */}
      <div className="absolute inset-0 bg-(--color-hero-overlay)" />
      <div className="absolute inset-0 bg-linear-to-r from-background/60 via-background/40 to-background/10" />

      {/* Content */}
      <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <motion.div
          animate="visible"
          className="max-w-2xl"
          initial="hidden"
          variants={containerVariants}
        >
          {/* Badge */}
          <motion.div
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-chart-1/40 bg-background/90 px-4 py-2 shadow-lg backdrop-blur-md"
            variants={itemVariants}
          >
            <Bell className="h-4 w-4 text-chart-1" />
            <span className="font-medium text-foreground text-sm">
              Stay Informed
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            className="mb-5 text-balance font-bold text-3xl text-hero-text drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)] sm:text-4xl lg:text-5xl dark:drop-shadow-[0_8px_28px_rgba(0,0,0,0.8)]"
            variants={itemVariants}
          >
            Exciting Events Are{" "}
            <span className="text-hero-text">Coming Soon</span>
          </motion.h2>

          {/* Description */}
          <motion.p
            className="mb-8 max-w-lg text-hero-text text-lg leading-relaxed drop-shadow-[0_1px_4px_rgba(255,255,255,0.2)] dark:drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
            variants={itemVariants}
          >
            We're preparing new networking opportunities and business events for
            our community. Check back soon or explore our past events to see
            what IBC has to offer.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div className="flex flex-wrap gap-4" variants={itemVariants}>
            <Button
              className="h-13 rounded-3xl bg-chart-1 px-8 font-semibold text-base text-card shadow-chart-1/40 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-chart-1/90 hover:shadow-chart-1/50 hover:shadow-xl"
              onClick={() => onNavigate("public-events")}
              size="lg"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Browse Past Events
            </Button>
            <Link href="/contact" scroll={false}>
              <Button
                className="h-13 rounded-3xl border-2 border-foreground/25 bg-background/80 px-7 font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-foreground/40 hover:bg-background/90"
                size="lg"
                variant="outline"
              >
                Get Notified
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
