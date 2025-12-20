"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MembershipCTA() {
  return (
    <section className="relative overflow-hidden py-16">
      <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-[#2E2A6E]/5" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="rounded-3xl bg-white/70 p-8 text-center shadow-xl ring-1 ring-white/50 backdrop-blur-xl md:p-12"
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="mb-4 font-bold text-3xl text-foreground">
            Ready to Get Connected?
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-foreground/70">
            Connect with like-minded business professionals and take your
            business to the next level.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              className="rounded-xl bg-primary shadow-lg hover:bg-primary/90"
              size="lg"
            >
              <Link href="/contact">Apply for Membership</Link>
            </Button>

            <Button
              asChild
              className="rounded-xl shadow-lg hover:text-primary"
              size="lg"
              variant="outline"
            >
              <Link href="/contact">Check Application Status</Link>
            </Button>

            <Button
              asChild
              className="rounded-xl shadow-lg"
              size="lg"
              variant="ghost"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
