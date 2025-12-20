"use client";

import { Eye, Target } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";

export function AboutVisionMission() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid gap-8 md:grid-cols-2"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          <motion.div variants={fadeInUp}>
            <VisionMissionCard
              description="To build and catalyze a sustainable business community which will expand the frontiers of growth and development in the region."
              icon={Eye}
              title="Our Vision"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <VisionMissionCard
              description="As a socially & environmentally responsible business community, generate optimum benefits to stakeholders through policy advisory & advocacy; vital support services & trade; tourism and investment promotion."
              icon={Target}
              title="Our Mission"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

interface VisionMissionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const VisionMissionCard = ({
  icon: Icon,
  title,
  description,
}: VisionMissionCardProps) => (
  <Card className="group relative h-full overflow-hidden border-0 bg-white/70 ring-1 ring-white/50 drop-shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
    <div className="absolute top-0 right-0 left-0 h-1 bg-primary" />
    <CardContent className="p-8">
      <div className="mb-8 flex items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-12 w-12 text-primary" />
        </div>
        <h3 className="font-bold text-3xl text-foreground">{title}</h3>
      </div>
      <p className="mb-4 text-foreground/80 text-xl leading-relaxed">
        {description}
      </p>
    </CardContent>
  </Card>
);
