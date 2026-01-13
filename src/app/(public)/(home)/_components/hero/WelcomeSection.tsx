"use client";

import {
  ArrowRight,
  Award,
  Building2,
  Calendar,
  Lightbulb,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "./AnimatedNumber";
import { FloatingParticles } from "./FloatingParticle";

interface WelcomeSectionProps {
  onNavigate: (page: string) => void;
}

const stats = [
  { number: 30, label: "Years of Excellence", suffix: "+", icon: Award },
  { number: 90, label: "Business Members", suffix: "+", icon: Users },
  { number: 50, label: "Annual Events", suffix: "+", icon: Calendar },
  { number: 20, label: "Industry Partners", suffix: "+", icon: Building2 },
];

export function WelcomeSection({ onNavigate }: WelcomeSectionProps) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="absolute inset-0"
      exit={{ opacity: 0, scale: 1.02 }}
      initial={{ opacity: 0 }}
      key="welcome"
      transition={{ duration: 0.8 }}
    >
      <FloatingParticles />

      {/* Background Image with Ken Burns effect */}
      <motion.div
        animate={{ scale: 1.08 }}
        className="absolute inset-0 h-full w-full"
        initial={{ scale: 1 }}
        transition={{ duration: 25, ease: "linear" }}
      >
        <Image
          alt="Business professionals networking"
          className="object-cover brightness-100 dark:brightness-75 dark:contrast-110 dark:saturate-90"
          fill
          priority
          src="/images/backgrounds/iloilo-2.jpg"
        />
      </motion.div>

      {/* Hero Overlay with contrast-safe tokens */}
      <div className="absolute inset-0 bg-(--color-hero-overlay)" />
      <div className="absolute inset-0 bg-linear-to-br from-chart-1/20 via-transparent to-chart-2/20 dark:from-chart-1/10 dark:to-chart-2/10" />

      {/* Decorative Blue Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          className="absolute top-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-chart-1/30 blur-[100px]"
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          className="absolute bottom-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-chart-2/25 blur-[80px]"
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 3,
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]"
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1.5,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <motion.div>
            {/* Badge */}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-chart-1/40 bg-background/90 px-5 py-2.5 shadow-lg backdrop-blur-md"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Lightbulb className="h-4 w-4 text-chart-1" />
              <span className="font-semibold text-foreground text-sm tracking-wide">
                Established 1990
              </span>
            </motion.div>

            <motion.h1
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 font-bold text-4xl text-hero-text leading-[1.1] drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-6xl xl:text-7xl dark:drop-shadow-[0_8px_28px_rgba(0,0,0,0.8)]"
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="mb-2 block text-balance font-semibold text-destructive-foreground text-md">
                Welcome to
              </span>
              <div className="-space-y-2">
                <span className="block text-balance text-chart-1">
                  Iloilo Business Club, Inc
                </span>
              </div>
            </motion.h1>

            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 max-w-xl text-pretty text-destructive-foreground text-lg leading-relaxed sm:text-xl lg:text-2xl"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Sustaining the Momentum for Progress.
            </motion.p>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <Link href="/about" scroll={false}>
                <Button
                  className="h-13 rounded-3xl bg-chart-1 px-8 font-semibold text-base text-card shadow-chart-1/40 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-chart-1/90 hover:shadow-chart-1/50 hover:shadow-xl"
                  size="lg"
                >
                  Discover More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/membership/application" scroll={false}>
                <Button
                  className="h-13 rounded-3xl border-2 border-foreground/25 bg-background/80 px-7 font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-foreground/40 hover:bg-background/90"
                  size="lg"
                  variant="outline"
                >
                  Become a Member
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Content - Stats Cards */}
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="hidden grid-cols-2 gap-5 lg:grid"
            initial={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="group rounded-2xl border border-chart-1/30 bg-card/95 p-6 shadow-lg backdrop-blur-lg transition-all duration-300 hover:border-chart-1/50 hover:bg-card dark:bg-card/85"
                initial={{ opacity: 0, y: 20 }}
                key={stat.label}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="rounded-xl bg-chart-1/20 p-2.5 transition-colors group-hover:bg-chart-1/30">
                    <stat.icon className="h-5 w-5 text-chart-1" />
                  </div>
                </div>
                <div className="mb-1 font-bold text-4xl text-card-foreground">
                  <AnimatedNumber value={stat.number} />
                  <span className="text-chart-1">{stat.suffix}</span>
                </div>
                <div className="font-medium text-muted-foreground text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ opacity: 1 }}
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        transition={{ delay: 1.5 }}
      >
        <span className="font-semibold text-destructive-foreground text-sm tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          className="flex h-11 w-7 justify-center rounded-full border-2 border-chart-1 bg-background/95 pt-2 shadow-xl backdrop-blur-md dark:border-chart-1/60 dark:bg-background/40"
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          <motion.div
            animate={{ y: [0, 14, 0], opacity: [1, 0.3, 1] }}
            className="h-1.5 w-1.5 rounded-full bg-chart-1"
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
