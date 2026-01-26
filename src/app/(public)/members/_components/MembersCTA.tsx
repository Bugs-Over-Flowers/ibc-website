"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MembersCTA() {
  return (
    <section className="relative overflow-hidden py-16">
      <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-[#2E2A6E]/5" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="rounded-3xl bg-white/70 p-8 text-center shadow-xl ring-1 ring-white/50 backdrop-blur-xl md:p-12 dark:bg-slate-950/70 dark:ring-white/20"
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="mb-4 font-bold text-3xl text-foreground">
            Become an IBC Member
          </h2>

          <p className="mx-auto mb-6 max-w-2xl text-foreground/70">
            Join our elite roster of members & enjoy networking events,
            marketing opportunities, access to data and information, and
            attendance to major business events. Becoming a member is the best
            investment you can make.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button
                className="rounded-xl bg-primary px-6 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary/90 hover:shadow-primary/25 hover:shadow-xl"
                size="lg"
              >
                Apply for Membership
              </Button>
            </Link>

            <Link href="/contact">
              <Button
                className="rounded-xl border-border bg-transparent px-6 font-semibold transition-all hover:scale-[1.02] hover:border-primary/50 hover:bg-primary/5"
                size="lg"
                variant="outline"
              >
                Check Application Status
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
