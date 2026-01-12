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
      <Image
        alt="Iloilo Business Club networking event"
        className="object-cover"
        fill
        priority
        src="/images/backgrounds/bg-2.jpg"
      />

      {/* Multi-layer Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-900/90 via-slate-900/75 to-sky-900/50" />
      <div className="absolute inset-0 bg-linear-to-t from-slate-900/70 via-transparent to-slate-900/40" />

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
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md"
            variants={itemVariants}
          >
            <Bell className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm text-white/90">
              Stay Informed
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            className="mb-5 text-balance font-bold text-3xl text-white sm:text-4xl lg:text-5xl"
            variants={itemVariants}
          >
            Exciting Events Are{" "}
            <span className="bg-linear from-primary via-sky-400 to-cyan-300 bg-clip-text text-transparent">
              Coming Soon
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            className="mb-8 max-w-lg text-lg text-white/80 leading-relaxed"
            variants={itemVariants}
          >
            We're preparing new networking opportunities and business events for
            our community. Check back soon or explore our past events to see
            what IBC has to offer.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div className="flex flex-wrap gap-4" variants={itemVariants}>
            <Button
              className="h-12 rounded-full bg-primary px-7 font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] hover:bg-primary/90 hover:shadow-primary/30 hover:shadow-xl"
              onClick={() => onNavigate("public-events")}
              size="lg"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Browse Past Events
            </Button>
            <Link href="/contact" scroll={false}>
              <Button
                className="h-12 rounded-full border-2 border-white/30 bg-white/5 px-7 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-white/50 hover:bg-white/15"
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
