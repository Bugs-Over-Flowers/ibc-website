"use client";

import {
  ArrowRight,
  Award,
  Building2,
  Calendar,
  Sparkles,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "./AnimatedNumber";
import { FloatingParticles } from "./FloatingParticle";

interface WelcomeSectionProps {
  onNavigate: (page: string) => void;
}

const stats = [
  { number: 35, label: "Years of Excellence", suffix: "+", icon: Award },
  { number: 500, label: "Business Members", suffix: "+", icon: Users },
  { number: 100, label: "Annual Events", suffix: "+", icon: Calendar },
  { number: 50, label: "Industry Partners", suffix: "+", icon: Building2 },
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
          className="object-cover"
          fill
          priority
          src="/images/backgrounds/bg-1.jpg"
        />
      </motion.div>

      {/* Gradient Overlay with brand colors */}
      <div className="absolute inset-0 bg-linear-to-br from-foreground/95 via-foreground/85 to-primary/40" />

      {/* Decorative Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          className="absolute top-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px]"
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          className="absolute bottom-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[80px]"
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 3,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <motion.div className="text-primary-foreground">
            {/* Badge */}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-5 py-2.5 backdrop-blur-md"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm tracking-wide">
                Established 1990
              </span>
            </motion.div>

            <motion.h1
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 font-bold text-4xl leading-[1.1] sm:text-5xl lg:text-6xl xl:text-7xl"
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="mb-2 block text-balance font-medium text-md">
                Welcome to
              </span>
              <div className="-space-y-2">
                <span className="block bg-linear-to-r from-primary via-accent to-secondary bg-clip-text pb-0 text-md text-transparent">
                  Iloilo
                </span>
                <span className="block bg-linear-to-r from-primary via-accent to-secondary bg-clip-text pb-2 text-md text-transparent">
                  Business Club
                </span>
              </div>
            </motion.h1>

            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 max-w-xl text-pretty text-lg text-primary-foreground/80 leading-relaxed sm:text-xl lg:text-2xl"
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
              <Button
                className="h-13 rounded-full bg-primary px-8 font-semibold text-base text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:shadow-primary/40 hover:shadow-xl"
                onClick={() => onNavigate("about")}
                size="lg"
              >
                Discover More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                className="h-13 rounded-full border-primary-foreground/30 bg-primary-foreground/10 px-8 font-semibold text-base text-primary-foreground backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-primary-foreground/50 hover:bg-primary-foreground/20"
                onClick={() => onNavigate("membership-application")}
                size="lg"
                variant="outline"
              >
                Become a Member
              </Button>
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
                className="group rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-6 backdrop-blur-lg transition-all duration-300 hover:bg-primary-foreground/15"
                initial={{ opacity: 0, y: 20 }}
                key={stat.label}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="rounded-xl bg-primary/20 p-2.5 transition-colors group-hover:bg-primary/30">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mb-1 font-bold text-4xl text-primary-foreground">
                  <AnimatedNumber value={stat.number} />
                  <span className="text-primary">{stat.suffix}</span>
                </div>
                <div className="font-medium text-primary-foreground/70 text-sm">
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
        className="-translate-x-1/2 absolute bottom-10 left-1/2 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        transition={{ delay: 1.5 }}
      >
        <span className="font-medium text-primary-foreground/60 text-sm tracking-wide">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          className="flex h-11 w-7 justify-center rounded-full border-2 border-primary-foreground/30 pt-2"
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          <motion.div
            animate={{ y: [0, 14, 0], opacity: [1, 0.3, 1] }}
            className="h-1.5 w-1.5 rounded-full bg-primary"
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
