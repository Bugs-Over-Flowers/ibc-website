"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EventsCTA() {
  return (
    <section className="relative overflow-hidden py-16">
      <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-[#2E2A6E]/5" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="rounded-3xl bg-card/80 p-8 text-center shadow-xl ring-1 ring-border/50 backdrop-blur-xl md:p-12"
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="mb-4 font-bold text-3xl text-foreground">
            Want to Host an Event?
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
            Partner with Iloilo Business Club to organize business events,
            seminars, and networking sessions that bring together the
            region&apos;s top business leaders.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
              href="/contact"
            >
              Contact Us
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-xl border border-primary/50 bg-background px-6 font-medium text-foreground shadow-lg transition-colors hover:border-primary hover:bg-primary/10"
              href="/contact"
            >
              Learn More About IBC
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
