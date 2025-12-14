"use client";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";

const goals = [
  "Increase by 5% the number of trailblazer companies in Iloilo",
  "Support to policy advocacy agenda",
  "Support development of community/business clusters",
  "Network to relevant and applicable forums",
  "Establishment of required & pro-climate investment & govt brand merchandising",
  "Increased capacity for sustainable investment, trade & tourism development",
  "Promote environmental protection policies",
];

export default function AboutGoals() {
  return (
    <section
      className="relative scroll-mt-32 overflow-hidden py-20"
      id="our-goals"
    >
      <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-[#2E2A6E]/5 blur-[100px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          <motion.div
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 backdrop-blur-sm"
            variants={fadeInUp}
          >
            <Target className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary text-sm">
              Strategic Objectives
            </span>
          </motion.div>
          <motion.h2
            className="mb-4 font-bold text-4xl text-[#2E2A6E]"
            variants={fadeInUp}
          >
            Our Goals
          </motion.h2>
          <motion.p
            className="mx-auto max-w-3xl text-foreground/70 text-lg"
            variants={fadeInUp}
          >
            Strategic objectives of our organization to drive economic growth
            and business excellence in Iloilo
          </motion.p>
        </motion.div>
        <motion.div
          className="grid gap-6 md:grid-cols-2"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          {goals.map((goal, index) => (
            <motion.div key={goal} variants={fadeInUp}>
              <Card className="hover:-translate-y-1 h-full border-0 bg-white/60 shadow-lg ring-1 ring-white/50 backdrop-blur-xl transition-all duration-300 hover:bg-white/80 hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20 backdrop-blur-sm">
                      <span className="font-bold text-primary text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-foreground/80 text-lg leading-relaxed">
                      {goal}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
