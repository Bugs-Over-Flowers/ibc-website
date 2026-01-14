"use client";

import {
  Award,
  Globe,
  Handshake,
  Lightbulb,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Handshake,
    title: "Business Networking",
    description:
      "Connect with industry leaders and fellow entrepreneurs to expand your professional network.",
  },
  {
    icon: TrendingUp,
    title: "Growth Opportunities",
    description:
      "Access exclusive business opportunities and partnerships that drive sustainable growth.",
  },
  {
    icon: Users,
    title: "Community Support",
    description:
      "Be part of a supportive community that champions local businesses and entrepreneurship.",
  },
  {
    icon: Award,
    title: "Excellence Recognition",
    description:
      "Celebrate achievements through our annual awards and recognition programs.",
  },
  {
    icon: Globe,
    title: "Regional Impact",
    description:
      "Contribute to the economic development and progress of Iloilo and Western Visayas.",
  },
  {
    icon: Lightbulb,
    title: "Innovation Hub",
    description:
      "Stay ahead with insights on industry trends, innovations, and best practices.",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="mb-4 text-balance font-bold text-3xl text-foreground sm:text-4xl lg:text-5xl">
            Why Join Iloilo Business Club, Inc?{" "}
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground leading-relaxed">
            Join a community dedicated to fostering growth, collaboration, and
            progress in the business landscape.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              className="group rounded-2xl border border-border bg-card p-8 shadow-sm ring-1 ring-border/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg dark:bg-card/80 dark:ring-white/10"
              initial={{ opacity: 0, y: 20 }}
              key={feature.title}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="mb-5 inline-flex rounded-xl bg-primary/10 p-3 transition-colors group-hover:bg-primary/20 dark:bg-primary/20 dark:group-hover:bg-primary/30">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 font-semibold text-foreground text-xl">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
