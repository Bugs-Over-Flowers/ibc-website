"use client";

import {
  Building2,
  Globe,
  Palette,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";

const goals = [
  {
    icon: TrendingUp,
    title: "Increase Trailblazer Companies",
    description: "Increase by 5% the number of trailblazer companies in Iloilo",
  },
  {
    icon: Shield,
    title: "Policy Advocacy",
    description: "Support policy advocacy agenda for business development",
  },
  {
    icon: Users,
    title: "Community Development",
    description: "Support development of community/business clusters",
  },
  {
    icon: Globe,
    title: "Network & Forums",
    description: "Network to relevant and applicable forums",
  },
  {
    icon: Building2,
    title: "Sustainable Investment",
    description:
      "Increased capacity for sustainable investment, trade & tourism development",
  },
  {
    icon: Palette,
    title: "Environmental Protection",
    description: "Promote environmental protection policies",
  },
];

export function AboutGoals() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          <h2 className="mb-4 text-balance font-bold text-3xl text-foreground sm:text-4xl">
            Our Goals
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Driving economic growth and business excellence in Iloilo
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          {goals.map((goal, index) => {
            const Icon = goal.icon;
            return (
              <motion.div key={goal.title} variants={fadeInUp}>
                <Card className="hover:-translate-y-1 group relative h-full overflow-hidden border-0 bg-white/70 shadow-xl ring-1 ring-white/50 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-transparent via-primary to-transparent" />
                  <CardContent className="flex flex-col items-center p-8 text-center">
                    <div className="mb-6 flex items-center justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                    </div>
                    <h3 className="mb-3 font-bold text-foreground text-xl">
                      {goal.title}
                    </h3>
                    <p className="mb-4 text-foreground/80 leading-relaxed">
                      {goal.description}
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
