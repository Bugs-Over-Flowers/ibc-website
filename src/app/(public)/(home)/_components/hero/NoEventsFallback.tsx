"use client";

import {
  ArrowRight,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NoEventsFallbackProps {
  direction: number;
  onNavigate: (page: string) => void;
  onGoHome: () => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 1.02,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
    scale: 0.98,
  }),
};

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

export function NoEventsFallback({
  direction,
  onNavigate,
  onGoHome,
}: NoEventsFallbackProps) {
  return (
    <motion.div
      animate="center"
      className="absolute inset-0"
      custom={direction}
      exit="exit"
      initial="enter"
      key="no-events"
      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
      variants={slideVariants}
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

      {/* Navigation Controls */}
      <button
        aria-label="Go to home"
        className="group absolute top-1/2 left-4 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/40 bg-background/70 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-border hover:bg-background/90 lg:left-6 lg:h-12 lg:w-12"
        onClick={onGoHome}
        type="button"
      >
        <ChevronLeft className="h-5 w-5 text-foreground transition-transform group-hover:-translate-x-0.5" />
      </button>
      <button
        aria-label="Go to home"
        className="group absolute top-1/2 right-4 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/40 bg-background/70 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-border hover:bg-background/90 lg:right-6 lg:h-12 lg:w-12"
        onClick={onGoHome}
        type="button"
      >
        <ChevronRight className="h-5 w-5 text-foreground transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* Home Dot */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
        <button
          aria-label="Go to home"
          className="group relative p-1"
          onClick={onGoHome}
          type="button"
        >
          <div className="flex h-2 w-2 items-center justify-center rounded-full bg-muted-foreground/30 transition-all duration-300 group-hover:bg-muted-foreground/50">
            <Home className="h-1.5 w-1.5 text-muted-foreground/60" />
          </div>
        </button>
      </div>
    </motion.div>
  );
}
