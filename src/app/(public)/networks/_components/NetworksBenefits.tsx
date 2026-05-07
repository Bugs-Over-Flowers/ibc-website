"use client";

import { motion } from "framer-motion";
import {
  Globe,
  Handshake,
  Lightbulb,
  type LucideIcon,
  Megaphone,
  Target,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";

type Benefit = {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
};

const benefits: Benefit[] = [
  {
    id: "collaboration",
    title: "Cross-Sector Collaboration",
    icon: Handshake,
    description:
      "Build stronger alliances between business leaders, institutions, and strategic partners through active cooperation.",
  },
  {
    id: "representation",
    title: "Collective Representation",
    icon: Megaphone,
    description:
      "Strengthen your voice in key conversations by participating in coordinated initiatives and shared priorities.",
  },
  {
    id: "shared-learning",
    title: "Shared Learning",
    icon: Lightbulb,
    description:
      "Exchange practical insights and proven approaches with organizations facing similar opportunities and challenges.",
  },
  {
    id: "regional-impact",
    title: "Regional Impact",
    icon: Target,
    description:
      "Align efforts around programs that support sustainable growth and meaningful outcomes for Iloilo's business ecosystem.",
  },
  {
    id: "visibility",
    title: "Network Visibility",
    icon: Globe,
    description:
      "Highlight your organization and representative profile in a trusted public directory used by the community.",
  },
  {
    id: "connections",
    title: "Leadership Connections",
    icon: Users,
    description:
      "Discover and connect with leaders driving initiatives across industries and public-private partnerships.",
  },
];

export default function NetworksBenefits() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute top-1/2 right-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          <motion.h2
            className="mb-4 font-bold text-4xl text-foreground"
            variants={fadeInUp}
          >
            Why Explore the Network Directory?
          </motion.h2>
          <motion.p
            className="mx-auto max-w-3xl text-foreground/70 text-lg"
            variants={fadeInUp}
          >
            Discover how network partnerships create stronger collaboration,
            clearer representation, and wider opportunities for growth.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-3"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <motion.div key={benefit.id} variants={fadeInUp}>
                <Card className="group relative h-full overflow-hidden border border-border/60 bg-card/80 shadow-xl ring-1 ring-border/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-primary via-primary/70 to-transparent" />
                  <CardContent className="p-8">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="font-bold text-foreground text-xl">
                        {benefit.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
