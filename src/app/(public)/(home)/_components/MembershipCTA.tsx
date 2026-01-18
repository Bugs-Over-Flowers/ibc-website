"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MembershipCTA() {
  return (
    <section className="bg-card py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="grid items-center lg:grid-cols-2">
            {/* Left Content */}
            <div className="p-8 lg:p-12">
              <motion.h2
                className="mb-4 text-balance font-bold text-2xl text-foreground sm:text-3xl"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                Ready to Grow Your Business Network?
              </motion.h2>

              <motion.p
                className="mb-8 max-w-md text-muted-foreground leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                Connect with like-minded business leaders, access exclusive
                events, and be part of Iloilo's premier business community.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <Link href="/membership/application">
                  <Button
                    className="rounded-xl bg-primary px-6 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary/90 hover:shadow-primary/25 hover:shadow-xl"
                    size="lg"
                  >
                    Apply for Membership
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/contact">
                  <Button
                    className="rounded-xl border-border bg-transparent px-6 font-semibold transition-all hover:scale-[1.02] hover:border-primary/50 hover:bg-primary/5"
                    size="lg"
                    variant="outline"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Us
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right Content - Decorative */}
            <div className="relative hidden aspect-square bg-linear-to-br from-primary/10 via-sky-500/5 to-transparent lg:block">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Animated glow */}
                  <motion.div
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.4, 0.6, 0.4],
                    }}
                    className="absolute -inset-12 rounded-full bg-primary/20 blur-3xl"
                    transition={{
                      duration: 5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Stats card */}
                  <div className="relative rounded-2xl border border-border bg-card p-8 shadow-2xl">
                    <div className="mb-4 text-center">
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <UserPlus className="h-8 w-8 text-primary" />
                      </div>
                      <p className="font-bold text-3xl text-foreground">90+</p>
                      <p className="text-muted-foreground text-sm">
                        Active Members
                      </p>
                    </div>
                    <div className="space-y-2 border-border border-t pt-4 text-center text-sm">
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          30+
                        </span>{" "}
                        years of excellence
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          50+
                        </span>{" "}
                        events annually
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
