"use client";

import { motion } from "framer-motion";
import { HeroBackgroundCarousel } from "@/components/website/HeroBackgroundCarousel";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";

interface NetworksHeroProps {
  backgroundImages?: string[];
}

const NETWORKS_HERO_FALLBACK_IMAGES = [
  "/images/backgrounds/bg-4.jpg",
  "/images/backgrounds/bg-about.jpg",
  "/images/backgrounds/bg-1.jpg",
  "/images/backgrounds/bg-2.jpg",
  "/images/backgrounds/bg-3.jpg",
];

export function NetworksHero({ backgroundImages }: NetworksHeroProps) {
  const images =
    backgroundImages && backgroundImages.length > 0
      ? backgroundImages
      : NETWORKS_HERO_FALLBACK_IMAGES;

  return (
    <section className="relative flex min-h-[50vh] items-center overflow-hidden pt-28 pb-14">
      <HeroBackgroundCarousel
        alt="IBC network partners"
        images={images}
        opacityClass="opacity-15"
      />

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
