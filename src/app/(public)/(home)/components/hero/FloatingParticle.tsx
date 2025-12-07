"use client";

import { motion } from "motion/react";

const PARTICLE_IDS = Array.from({ length: 15 }, () => crypto.randomUUID());

export function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={PARTICLE_IDS[i]}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          initial={{
            x: `${Math.random() * 100}%`,
            y: "110%",
            opacity: 0,
          }}
          animate={{
            y: "-10%",
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: Math.random() * 12 + 8,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 8,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
