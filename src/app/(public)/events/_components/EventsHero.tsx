"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { fadeInUp } from "@/components/animations/fade";
import { staggerContainer } from "@/components/animations/stagger";

export function EventsHero() {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden min-h-[60vh] flex items-center">
      {/* Static Background Image */}
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        <Image
          src="https://picsum.photos/seed/picsum/200/300"
          alt="Events background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#2E2A6E]/70 via-[#2E2A6E]/50" />
      </motion.div>

      {/* Animated Blur Orbs */}
      <motion.div
        className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.35, 0.2],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg"
          >
            IBC Events
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-white/90 text-lg leading-relaxed drop-shadow-md"
          >
            Discover upcoming events, seminars, and networking opportunities
            organized by the Iloilo Business Club. Connect with fellow business
            leaders and stay ahead of industry trends.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
