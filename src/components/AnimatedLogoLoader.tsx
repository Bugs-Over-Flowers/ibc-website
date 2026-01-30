"use client";

import { motion } from "framer-motion";

const logoVariants = {
  hidden: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 3,
      ease: "linear" as const,
      repeat: Number.POSITIVE_INFINITY,
    },
  },
};

const innerRingVariants = {
  hidden: { scale: 1, opacity: 0.3 },
  animate: {
    scale: [1, 1.02, 1],
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 3,
      ease: "easeInOut" as const,
      repeat: Number.POSITIVE_INFINITY,
    },
  },
};

export default function AnimatedLogoLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="text-center">
        <div className="relative mx-auto mb-12 h-56 w-56">
          <motion.div
            animate="animate"
            className="absolute top-1/2 left-1/2 h-64 w-64 rounded-full border border-white/8"
            initial="hidden"
            style={{ x: "-50%", y: "-50%" }}
            variants={innerRingVariants}
          />

          {/* Logo */}
          <motion.div
            animate="animate"
            className="absolute top-1/2 left-1/2 h-56 w-56"
            initial="hidden"
            style={{ x: "-50%", y: "-50%" }}
            variants={logoVariants}
          >
            <svg
              aria-label="Animated company logo"
              className="h-full w-full"
              role="img"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Animated company logo</title>
              {/* SVG filters for smooth, circular glow (avoids expanding square artifacts) */}
              <defs>
                <filter
                  height="200%"
                  id="purpleGlow"
                  width="200%"
                  x="-50%"
                  y="-50%"
                >
                  <feGaussianBlur
                    in="SourceGraphic"
                    result="blur"
                    stdDeviation="6"
                  />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter
                  height="200%"
                  id="greenGlow"
                  width="200%"
                  x="-50%"
                  y="-50%"
                >
                  <feGaussianBlur
                    in="SourceGraphic"
                    result="blur"
                    stdDeviation="6"
                  />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Blue semicircle (top) - uses filter for glow; pulse via strokeWidth */}
              <motion.path
                animate={{ strokeWidth: [16, 20, 16], opacity: [1, 0.95, 1] }}
                d="M 100 30 A 70 70 0 0 1 100 170"
                fill="none"
                filter="url(#purpleGlow)"
                stroke="#3D2B7E"
                strokeLinecap="round"
                strokeWidth={16}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                }}
              />

              {/* Green semicircle (bottom) - uses filter for glow; pulse via strokeWidth */}
              <motion.path
                animate={{ strokeWidth: [16, 20, 16], opacity: [1, 0.95, 1] }}
                d="M 100 170 A 70 70 0 0 1 100 30"
                fill="none"
                filter="url(#greenGlow)"
                stroke="#2ECC71"
                strokeLinecap="round"
                strokeWidth={16}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Loading text with dots */}
        <motion.div
          animate={{ opacity: [0.8, 1, 0.8] }}
          className="mt-20 font-semibold text-sm text-white uppercase tracking-widest dark:text-slate-200"
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          We're getting things ready{" "}
          <motion.span
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
            }}
          >
            ...
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
}
