"use client";

import { ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

function FacebookIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

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
                    <FacebookIcon className="mr-2 h-5 w-5" />
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
                        <FacebookIcon className="h-16 w-16 text-[#1877F2]" />
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
