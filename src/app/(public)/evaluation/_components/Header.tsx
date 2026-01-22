"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";

export function Header() {
  return (
    <section className="relative flex min-h-[60vh] items-center overflow-hidden pt-32 pb-16">
      {/* Animated Blur Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.35, 0.2],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        className="absolute top-20 right-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px]"
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
        className="absolute bottom-10 left-10 h-[400px] w-[400px] rounded-full bg-primary/15 blur-[80px]"
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          animate="visible"
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          variants={staggerContainer}
        >
          {/* Main Title */}
          <motion.h1
            className="mb-6 font-bold text-4xl text-foreground drop-shadow-lg md:text-5xl lg:text-6xl"
            variants={fadeInUp}
          >
            Evaluation Form
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-foreground/90 text-lg leading-relaxed"
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
