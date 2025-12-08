"use client";

import { motion } from "motion/react";
import { useId, useMemo } from "react";

// Seeded random number generator for deterministic values
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function FloatingParticles() {
  const id = useId();

  // Generate deterministic values based on component id
  const particles = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => {
      const seed = i + 1;
      return {
        id: `${id}-particle-${i}`,
        x: seededRandom(seed * 1) * 100,
        duration: seededRandom(seed * 2) * 12 + 8,
        delay: seededRandom(seed * 3) * 8,
      };
    });
  }, [id]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          initial={{
            x: `${particle.x}%`,
            y: "110%",
            opacity: 0,
          }}
          animate={{
            y: "-10%",
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: particle.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
