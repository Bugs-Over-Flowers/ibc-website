"use client";
import { motion } from "framer-motion";
import { Eye, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";

export default function AboutVisionMission() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-0 bg-linear-to-b from-muted/50 to-transparent" />
      <div className="absolute top-0 right-1/4 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[80px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid gap-8 md:grid-cols-2"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          <motion.div variants={fadeInUp}>
            <Card className="hover:-translate-y-1 h-full overflow-hidden border-0 bg-white/70 shadow-xl ring-1 ring-white/50 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl">
              <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-primary to-primary/50" />
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20 backdrop-blur-sm">
                    <Eye className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="font-bold text-2xl text-[#2E2A6E]">Vision</h2>
                </div>
                <p className="text-foreground/80 text-lg leading-relaxed">
                  To build and catalyze a sustainable business community which
                  will expand the frontiers of growth and development in the
                  region.
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Card className="hover:-translate-y-1 h-full overflow-hidden border-0 bg-white/70 shadow-xl ring-1 ring-white/50 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl">
              <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-[#2E2A6E] to-[#2E2A6E]/50" />
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2E2A6E]/10 ring-1 ring-[#2E2A6E]/20 backdrop-blur-sm">
                    <Target className="h-7 w-7 text-[#2E2A6E]" />
                  </div>
                  <h2 className="font-bold text-2xl text-[#2E2A6E]">Mission</h2>
                </div>
                <p className="text-foreground/80 text-lg leading-relaxed">
                  As a socially & environmentally responsible business
                  community, generate optimum benefits to stakeholders through
                  policy advisory & advocacy; vital support services & trade;
                  tourism and investment promotion.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
