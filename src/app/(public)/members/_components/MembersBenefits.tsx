"use client";

import { motion } from "framer-motion";
import {
  Award,
  BarChart2,
  Handshake,
  type LucideIcon,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";

type Benefit = {
  id: string;
  title: string;
  icon: LucideIcon;
};

const benefits: Benefit[] = [
  {
    id: "networking",
    title: "Networking Events",
    icon: Users,
  },
  {
    id: "market-intelligence",
    title: "Market Intelligence",
    icon: BarChart2,
  },
  {
    id: "policy-advocacy",
    title: "Policy Advocacy",
    icon: Handshake,
  },
  {
    id: "premium-events",
    title: "Premium Events",
    icon: Ticket,
  },
  {
    id: "business-support",
    title: "Business Support",
    icon: Award,
  },
  {
    id: "investment-promotion",
    title: "Investment Promotion",
    icon: TrendingUp,
  },
];

const benefitDescriptions: Record<string, string> = {
  networking:
    "Connect with 80+ senior executives through exclusive business gatherings and forums. Build lasting relationships and expand your network with Iloilo’s top business leaders.",
  "market-intelligence":
    "Access economic data, industry reports, and business insights for informed decision-making. Stay ahead with the latest trends and analytics tailored for Iloilo’s business community.",
  "policy-advocacy":
    "Representation in regional policy-making bodies to advance business interests. Your voice in shaping Iloilo’s business landscape and advocating for a better business environment.",
  "premium-events":
    "Priority access to trade expos, seminars, job fairs, and major business conferences. Participate in exclusive conferences and seminars that drive business growth.",
  "business-support":
    "Professional development programs and capacity-building workshops for your team. Grow your people and organization with expert-led training and support.",
  "investment-promotion":
    "Opportunities to participate in investment and tourism promotion initiatives. Showcase your business to new markets and investors through IBC’s network.",
};

export default function MembersBenefits() {
  return (
    <section
      className="relative scroll-mt-32 overflow-hidden py-20"
      id="benefits"
    >
      <div className="absolute top-1/2 right-0 h-[500px] w-[500px] rounded-full blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          <motion.div variants={fadeInUp}></motion.div>
          <motion.h2
            className="mb-4 font-bold text-4xl text-foreground"
            variants={fadeInUp}
          >
            Why Join IBC?
          </motion.h2>
          <motion.p
            className="mx-auto max-w-3xl text-foreground/70 text-lg"
            variants={fadeInUp}
          >
            Enjoy exclusive access and resources designed to accelerate your
            business growth and elevate your organization in Iloilo's business
            community.
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
                <Card className="group hover:-translate-y-1 relative h-full overflow-hidden border-0 bg-white/70 shadow-xl ring-1 ring-white/50 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl dark:bg-slate-950/70 dark:ring-white/20">
                  <div className="linear-to-r absolute top-0 right-0 left-0 h-1 from-primary via-primary/70 to-transparent" />
                  <CardContent className="p-8">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="linear-to-br flex h-14 w-14 items-center justify-center rounded-2xl from-primary/20 to-primary/5 ring-1 ring-primary/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="font-bold text-foreground text-xl">
                        {benefit.title}
                      </h3>
                    </div>
                    <p className="mb-4 text-foreground/80 leading-relaxed">
                      {benefitDescriptions[benefit.id]}
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
