"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";

export function Header() {
  return (
    <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden px-4 py-16 sm:min-h-[60vh] sm:px-6 lg:min-h-[70vh] lg:px-8">
      {/* Animated Blur Orbs - Responsive Sizing */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.35, 0.2],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        className="absolute top-10 right-0 h-[250px] w-[250px] rounded-full bg-primary/20 blur-[80px] sm:top-20 sm:h-[350px] sm:w-[350px] sm:blur-[100px] lg:h-[500px] lg:w-[500px]"
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        animate={{
          scale: [1, 0.8, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        className="absolute bottom-0 left-0 h-[200px] w-[200px] rounded-full bg-primary/15 blur-[60px] sm:bottom-10 sm:left-10 sm:h-[300px] sm:w-[300px] sm:blur-[80px] lg:h-[400px] lg:w-[400px]"
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl">
        <motion.div
          animate="visible"
          className="flex flex-col items-center justify-center text-center"
          initial="hidden"
          variants={staggerContainer}
        >
          {/* Main Title */}
          <motion.h1
            className="mb-4 font-bold text-2xl text-foreground drop-shadow-lg sm:mb-6 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
            variants={fadeInUp}
          >
            Evaluation Form
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-foreground/90 text-sm leading-relaxed sm:text-base md:text-lg lg:text-xl"
            variants={fadeInUp}
          >
            The information you provide will help us in planning future events
            and activities more effectively. We truly appreciate you taking the
            time to fill out the form!
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
