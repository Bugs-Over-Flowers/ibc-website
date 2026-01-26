"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Render star rating visualization
 * @param rating - Numeric rating (0-5)
 * @returns Array of Star components or null if no rating
 */
export function renderStars(rating: number | null | undefined) {
  if (!rating) return null;

  return Array.from({ length: 5 }).map((_, i) => {
    const starId = `star-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <Star
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating)
            ? "fill-primary text-primary"
            : i < rating
              ? "fill-primary text-primary opacity-50"
              : "text-muted-foreground",
        )}
        key={starId}
      />
    );
  });
}
