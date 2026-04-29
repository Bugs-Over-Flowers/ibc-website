"use client";

import { motion } from "framer-motion";
import { HeroBackgroundCarousel } from "@/components/website/HeroBackgroundCarousel";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";

interface MembersHeroProps {
  backgroundImages?: string[];
}

const MEMBERS_HERO_FALLBACK_IMAGES = [
  "/images/backgrounds/bg-4.jpg",
  "/images/backgrounds/bg-3.jpg",
  "/images/backgrounds/bg-2.jpg",
  "/images/backgrounds/bg-1.jpg",
  "/images/backgrounds/bg-about.jpg",
];

export function MembersHero({ backgroundImages }: MembersHeroProps) {
  const images =
    backgroundImages && backgroundImages.length > 0
      ? backgroundImages
      : MEMBERS_HERO_FALLBACK_IMAGES;

  return (
    <section className="relative flex min-h-[60vh] items-center overflow-hidden pt-32 pb-16">
      <HeroBackgroundCarousel
        alt="IBC Members Group Photo"
        images={images}
        opacityClass="opacity-20"
      />

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
            className="mb-6 font-bold text-4xl text-foreground drop-shadow-lg md:text-5xl lg:text-6xl"
            variants={fadeInUp}
          >
            IBC Members
          </motion.h1>
          <motion.p
            className="text-foreground/90 text-lg leading-relaxed"
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
