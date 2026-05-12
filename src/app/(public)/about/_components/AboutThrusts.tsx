"use client";

import { motion } from "motion/react";
import { resolveWebsiteContentIcon } from "@/app/(public)/_lib/websiteContentIconMap";
import RichTextDisplay from "@/components/RichTextDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";

interface AboutThrustItem {
  title: string;
  description: string;
  icon: string;
}

interface AboutThrustsProps {
  thrustsData?: AboutThrustItem[];
}

export function AboutThrusts({ thrustsData }: AboutThrustsProps) {
  const resolvedThrusts = thrustsData ?? [];

  return (
    <section className="bg-card py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="mb-4 text-balance font-bold text-3xl text-foreground sm:text-4xl">
            Company Thrusts
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Driving sustainable business growth and economic development in
            Iloilo
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-2"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          {resolvedThrusts.map((thrust) => {
            const Icon = resolveWebsiteContentIcon(thrust.icon);
            return (
              <motion.div key={thrust.title} variants={fadeInUp}>
                <Card className="group relative h-full overflow-hidden border-0 bg-card/95 shadow-xl ring-1 ring-border/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-primary via-primary/70 to-transparent" />
                  <CardContent className="p-8">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="wrap-break-word min-w-0 flex-1 font-bold text-foreground text-xl leading-tight">
                        {thrust.title}
                      </h3>
                    </div>
                    <RichTextDisplay
                      className="mb-4 text-foreground/80 leading-relaxed **:text-inherit"
                      content={thrust.description}
                    />
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
