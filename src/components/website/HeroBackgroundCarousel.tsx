"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface HeroBackgroundCarouselProps {
  images: string[];
  alt: string;
  opacityClass?: string;
  intervalMs?: number;
}

export function HeroBackgroundCarousel({
  images,
  alt,
  opacityClass = "opacity-20",
  intervalMs = 6000,
}: HeroBackgroundCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageSet = useMemo(
    () => images.filter((image) => image.trim().length > 0),
    [images],
  );

  useEffect(() => {
    if (imageSet.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((previousIndex) => (previousIndex + 1) % imageSet.length);
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [imageSet.length, intervalMs]);

  useEffect(() => {
    if (currentIndex >= imageSet.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, imageSet.length]);

  const activeImage = imageSet[currentIndex];

  if (!activeImage) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.06 }}
        key={activeImage}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      >
        <Image
          alt={alt}
          className={`object-cover ${opacityClass}`}
          fill
          priority
          src={activeImage}
          unoptimized
        />
      </motion.div>
    </AnimatePresence>
  );
}
