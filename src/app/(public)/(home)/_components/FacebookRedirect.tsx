"use client";

import { ExternalLink, Facebook } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function FacebookCTASection() {
  return (
    <section className="relative overflow-hidden bg-background py-20">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-[#1877F2]/5 via-transparent to-[#1877F2]/5" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="overflow-hidden rounded-2xl border border-border bg-background shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="grid items-center gap-8 lg:grid-cols-2">
            {/* Left Content */}
            <div className="p-8 lg:p-12">
              <motion.h2
                className="mb-4 text-balance font-bold text-2xl text-foreground sm:text-3xl"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                Stay Connected on Facebook
              </motion.h2>

              <motion.p
                className="mb-8 max-w-md text-muted-foreground leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                Follow Iloilo Business Club for the latest updates, event
                announcements, business insights, and community highlights. Join
                our growing online community!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <a
                  href="https://www.facebook.com/iloilobusinessclub"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Button
                    className="rounded-xl bg-[#1877F2] px-6 font-semibold text-white shadow-[#1877F2]/20 shadow-lg transition-all hover:scale-[1.02] hover:bg-[#1877F2]/90 hover:shadow-[#1877F2]/25 hover:shadow-xl"
                    size="lg"
                  >
                    <Facebook className="mr-2 h-5 w-5" />
                    Follow Us on Facebook
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </motion.div>
            </div>

            {/* Right Content - Decorative */}
            <div className="relative hidden aspect-square bg-linear-to-br from-[#1877F2]/10 via-[#1877F2]/5 to-transparent lg:block">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Animated glow */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    className="absolute -inset-10 rounded-full bg-[#1877F2]/20 blur-3xl"
                    transition={{
                      duration: 5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Card */}
                  <div className="relative rounded-2xl border border-border bg-card p-8 shadow-2xl">
                    <div className="mb-4 flex items-center justify-center">
                      <div className="rounded-2xl bg-[#1877F2]/10 p-4">
                        <Facebook className="h-16 w-16 text-[#1877F2]" />
                      </div>
                    </div>
                    <p className="mb-2 text-center font-semibold text-foreground text-lg">
                      @iloilobusinessclub
                    </p>
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

export default FacebookCTASection;
