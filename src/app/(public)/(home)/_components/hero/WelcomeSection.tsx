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
      key="welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0"
    >
      <FloatingParticles />

      {/* Background Image with Ken Burns effect */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: 25, ease: "linear" }}
      >
        <Image
          src="/images/backgrounds/bg-1.jpg"
          alt="Business professionals networking"
          fill
          className="object-cover"
          priority
        />
      </motion.div>

      {/* Gradient Overlay with brand colors */}
      <div className="absolute inset-0 bg-linear-to-br from-foreground/95 via-foreground/85 to-primary/40" />

      {/* Decorative Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[80px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 3,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
          {/* Left Content */}
          <motion.div className="text-primary-foreground">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 rounded-full px-5 py-2.5 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium tracking-wide">
                Established 1990
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="block text-balance mb-2 text-md font-medium">
                Welcome to
              </span>
              <div className="-space-y-2">
                <span className="block bg-linear-to-r from-primary via-accent to-secondary text-md bg-clip-text text-transparent pb-0">
                  Iloilo
                </span>
                <span className="block bg-linear-to-r from-primary via-accent to-secondary text-md bg-clip-text text-transparent pb-2">
                  Business Club
                </span>
              </div>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl lg:text-2xl text-primary-foreground/80 mb-10 max-w-xl text-pretty leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Sustaining the Momentum for Progress.
            </motion.p>

            <motion.div
              className="flex gap-4 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <Button
                onClick={() => onNavigate("about")}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 h-13 text-base font-semibold shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:scale-105"
              >
                Discover More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                onClick={() => onNavigate("membership-application")}
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-13 text-base font-semibold bg-primary-foreground/10 backdrop-blur-md border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:border-primary-foreground/50 transition-all duration-300 hover:scale-105"
              >
                Become a Member
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Content - Stats Cards */}
          <motion.div
            className="hidden lg:grid grid-cols-2 gap-5"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-primary-foreground/10 backdrop-blur-lg border border-primary-foreground/15 rounded-2xl p-6 hover:bg-primary-foreground/15 transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-primary/20 p-2.5 rounded-xl group-hover:bg-primary/30 transition-colors">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-primary-foreground mb-1">
                  <AnimatedNumber value={stat.number} />
                  <span className="text-primary">{stat.suffix}</span>
                </div>
                <div className="text-sm text-primary-foreground/70 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="text-primary-foreground/60 text-sm font-medium tracking-wide">
          Scroll to explore
        </span>
        <motion.div
          className="w-7 h-11 border-2 border-primary-foreground/30 rounded-full flex justify-center pt-2"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          <motion.div
            className="w-1.5 h-1.5 bg-primary rounded-full"
            animate={{ y: [0, 14, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
