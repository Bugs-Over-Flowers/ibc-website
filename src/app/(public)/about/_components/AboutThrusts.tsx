"use client";

import { Handshake, Palette, Shield, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";

const thrusts = [
  {
    title: "Policy Advisory & Advocacy",
    description:
      "We are at the forefront of issues concerning the business sector. Iloilo Business Club, Inc. holds membership to various regional and local policy-making bodies to represent and put forth critical agenda to improve planning and development, service delivery and the local business climate.",
    icon: Shield,
  },
  {
    title: "Investment Promotion",
    description:
      "Iloilo Business Club, Inc. is one of the founding business organizations of the Iloilo Economic Development Foundation, Inc. The Club partners with national government agencies, private companies and individuals that assist investors and businesses in locating and growing their business in Iloilo.",
    icon: TrendingUp,
  },
  {
    title: "Tourism, Culture, Heritage & Arts",
    description:
      "To boost efforts to promote the Province and the City of Iloilo as a tourist destination, Iloilo Business Club, Inc. pursues partnerships and roles that provide capacity development for local stakeholders, discover new markets with growth potential, and improve services and facilities.",
    icon: Palette,
  },
  {
    title: "Business Support Services",
    description:
      "Projects and activities of Iloilo Business Club are carefully selected to address the needs of its membership and the business sector in general. Economic data and information from key national government agencies and local government units are accessed for members upon request.",
    icon: Handshake,
  },
];

export function AboutThrusts() {
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
          {thrusts.map((thrust) => {
            const Icon = thrust.icon;
            return (
              <motion.div key={thrust.title} variants={fadeInUp}>
                <Card className="group relative h-full overflow-hidden border-0 bg-card/95 shadow-xl ring-1 ring-border/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-primary via-primary/70 to-transparent" />
                  <CardContent className="p-8">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="font-bold text-foreground text-xl">
                        {thrust.title}
                      </h3>
                    </div>
                    <p className="mb-4 text-foreground/80 leading-relaxed">
                      {thrust.description}
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
