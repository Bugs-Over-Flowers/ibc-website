"use client";

import { Facebook, MessageCircle, ThumbsUp, Users } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function FacebookCTASection() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="overflow-hidden rounded-2xl border border-border bg-card"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="p-8 lg:p-12">
              <div className="mb-6 inline-flex rounded-xl bg-primary/10 p-4">
                <Facebook className="h-8 w-8 text-[#2E2A6E]" />
              </div>
              <h2 className="mb-4 text-balance font-bold text-2xl text-foreground sm:text-3xl">
                Stay Connected on Facebook
              </h2>
              <p className="mb-8 text-muted-foreground leading-relaxed">
                Follow the Iloilo Business Club on Facebook for the latest
                updates, event announcements, business insights, and community
                highlights. Join our growing online community!
              </p>

              <Button
                asChild
                className="rounded-lg bg-[#2E2A6E] px-8 text-white hover:bg-[#2E2A6E]/90"
                size="lg"
              >
                <a
                  href="https://www.facebook.com/iloilobusinessclub"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Facebook className="mr-2 h-5 w-5" />
                  Follow Us on Facebook
                </a>
              </Button>
            </div>
            <div className="relative hidden aspect-square bg-linear-to-br from-primary/20 to-primary/5 lg:block">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.3, 0.5] }}
                    className="-inset-8 absolute rounded-full bg-primary/20 blur-2xl"
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                  <div className="relative rounded-2xl border border-primary/20 bg-card p-8 shadow-xl">
                    <Facebook className="mx-auto mb-4 h-24 w-24 text-[#2E2A6E]" />
                    <p className="mt-4 text-center font-semibold text-foreground">
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
