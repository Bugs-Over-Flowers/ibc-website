"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EventsCTA() {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-[#2E2A6E]/5" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl ring-1 ring-white/50 p-8 md:p-12 text-center"
        >
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Want to Host an Event?
          </h2>
          <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
            Partner with Iloilo Business Club to organize business events,
            seminars, and networking sessions that bring together the
            region&apos;s top business leaders.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 shadow-lg rounded-xl"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-xl hover:text-primary shadow-lg"
            >
              <Link href="/about">Learn More About IBC</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
