"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";

export default function AboutStory() {
  return (
    <section
      className="relative scroll-mt-32 overflow-hidden py-20"
      id="our-story"
    >
      <div className="-translate-x-1/2 absolute top-0 left-1/2 h-[300px] w-[700px] rounded-full bg-linear-to-b from-primary/5 to-transparent blur-[100px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <motion.div
            className=""
            initial="hidden"
            variants={staggerContainer}
            viewport={{ once: true, margin: "-100px" }}
            whileInView="visible"
          >
            <motion.h2
              className="mb-4 font-bold text-3xl text-[#2E2A6E]"
              variants={fadeInUp}
            >
              Our Story
            </motion.h2>
            <motion.p
              className="whitespace-pre-line text-foreground/70 text-lg"
              variants={fadeInUp}
            >
              {`We are Iloilo's premier business organization. Established on October 1990, Iloilo Business Club, Inc. (IBC) is a non-stock, non-profit corporation composed of over eighty (80) Senior Executives representing the leading Corporations and Business Organizations in the Province. The Philippines is a Country divided into three (3) major islands - Luzon, Visayas and Mindanao. The Visayas, retail, utility, services, manufacturing, financial institutions, agribusiness, and the educational institutions.

Its policy formulating fact track the IBC is structured and programmed primarily by its three major thrusts - policy advocacy, information services and trade and investment promotion.

IBC's commitment is to promote the City and the Province of Iloilo as a tourist & investment destination, create opportunities to boost the local economy, and maintain a strong partnership with our government and private sector stakeholders.`}
            </motion.p>
          </motion.div>
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <div className="relative h-[400px] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/20">
              {/* <Image
                src="/business-meeting-conference-professional-executive.jpg"
                alt="IBC Business Meeting"
                fill
                className="object-cover"
              /> */}
              <div className="absolute inset-0 bg-linear-to-t from-[#2E2A6E]/50 to-transparent" />
            </div>
            <motion.div
              className="-bottom-6 -left-6 absolute rounded-2xl border border-white/50 bg-white/80 p-5 shadow-xl ring-1 ring-primary/10 backdrop-blur-xl"
              initial={{ opacity: 0, x: -20 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <p className="font-bold text-4xl text-primary">80+</p>
              <p className="text-foreground/70 text-sm">Senior Executives</p>
            </motion.div>
            <motion.div
              className="-top-4 -right-4 absolute rounded-2xl border border-white/50 bg-white/80 p-5 shadow-xl ring-1 ring-[#2E2A6E]/10 backdrop-blur-xl"
              initial={{ opacity: 0, x: 20 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <p className="font-bold text-4xl text-foreground">1990</p>
              <p className="text-foreground/70 text-sm">Established</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
