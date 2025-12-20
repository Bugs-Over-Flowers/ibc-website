"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";

export function MembersHero() {
  return (
    <section className="relative flex min-h-[60vh] items-center overflow-hidden pt-32 pb-16">
      {/* Static Background Image */}
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      >
        <Image
          alt="IBC Members Group Photo"
          className="object-cover"
          fill
          priority
          src="/images/backgrounds/bg-4.jpg"
        />
        {/* New gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-foreground/95 via-foreground/85 to-primary/40" />
        {/* Existing blue overlay */}
      </motion.div>

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

      {/* Content */}
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          animate="visible"
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          variants={staggerContainer}
        >
          <motion.h1
            className="mb-6 font-bold text-4xl text-white drop-shadow-lg md:text-5xl lg:text-6xl"
            variants={fadeInUp}
          >
            IBC Members
          </motion.h1>
          <motion.p
            className="text-lg text-white/90 leading-relaxed drop-shadow-md"
            variants={fadeInUp}
          >
            Meet the Iloilo Business Club members, discover their stories, and
            connect with the region's top business leaders and organizations.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
