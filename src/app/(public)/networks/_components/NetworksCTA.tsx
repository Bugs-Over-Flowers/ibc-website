"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NetworksCTA() {
  return (
    <section className="relative overflow-hidden py-16">
      <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-accent/60" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="rounded-3xl bg-card/80 p-8 text-center shadow-xl ring-1 ring-border/60 backdrop-blur-xl md:p-12"
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="mb-4 font-bold text-3xl text-foreground">
            Build Stronger Partnerships
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
            Join IBC's growing business community and connect with leaders,
            organizations, and initiatives shaping Iloilo's future.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/membership/application">
              <Button
                className="rounded-xl bg-primary px-6 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary/90"
                size="lg"
              >
                Apply for Membership
              </Button>
            </Link>

            <Link href="/members">
              <Button
                className="rounded-xl border-border bg-transparent px-6 font-semibold transition-all hover:scale-[1.02] hover:border-primary/50 hover:bg-primary/5"
                size="lg"
                variant="outline"
              >
                Explore Members
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
