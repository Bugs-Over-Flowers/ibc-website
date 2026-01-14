"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function MembersLoading() {
  return (
    <section className="relative overflow-hidden py-0">
      {/* Animated background orbs (framer-motion) */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
        className="pointer-events-none absolute top-1/4 left-0 h-[400px] w-[400px] select-none rounded-full bg-primary/5 blur-[120px]"
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.12, 0.05] }}
        className="pointer-events-none absolute right-0 bottom-1/4 h-[500px] w-[500px] select-none rounded-full bg-accent/10 blur-[120px]"
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      {/* Main content skeleton */}
      <div className="relative z-10">
        {/* Filter Bar Skeleton */}
        <section className="border-border border-b bg-background py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <Skeleton className="h-[52px] w-full rounded-xl bg-muted/60" />
              </div>
              <div className="w-full sm:w-64">
                <Skeleton className="h-[52px] w-full rounded-xl bg-muted/60" />
              </div>
            </div>
            <div className="text-muted-foreground text-sm">
              <Skeleton className="h-4 w-32 rounded bg-muted/60" />
            </div>
          </div>
        </section>
        {/* Members Grid Skeleton */}
        <section className="bg-muted/50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => `member-skeleton-${i}`).map(
                (key) => (
                  <div
                    className="flex h-full min-h-[400px] flex-col overflow-hidden rounded-xl bg-white p-0 transition-shadow"
                    key={key}
                  >
                    <Skeleton className="aspect-square h-auto w-full bg-muted/60" />
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4">
                      <Skeleton className="h-6 w-32 rounded bg-muted/60" />
                      <Skeleton className="h-4 w-20 rounded bg-muted/50" />
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
