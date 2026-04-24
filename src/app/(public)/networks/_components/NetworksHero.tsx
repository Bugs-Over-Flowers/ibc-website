"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";

export function NetworksHero() {
  return (
    <section className="relative flex min-h-[50vh] items-center overflow-hidden pt-28 pb-14">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      >
        <Image
          alt="IBC network partners"
          className="object-cover opacity-15"
          fill
          priority
          src="/images/backgrounds/bg-4.jpg"
        />
      </motion.div>

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.3, 0.15],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        className="absolute top-20 right-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px]"
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          animate="visible"
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          variants={staggerContainer}
        >
          <motion.h1
            className="mt-4 mb-4 font-bold text-4xl text-foreground md:text-5xl lg:text-6xl"
            variants={fadeInUp}
          >
            Networks
          </motion.h1>
          <motion.p
            className="text-foreground/85 text-lg leading-relaxed"
            variants={fadeInUp}
          >
            Explore partner organizations and the leaders representing each
            network across Iloilo's business community.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
