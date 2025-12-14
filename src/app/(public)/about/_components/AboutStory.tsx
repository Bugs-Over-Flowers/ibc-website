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
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-8 text-center"
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
            className="mx-auto max-w-3xl whitespace-pre-line text-foreground/70 text-lg"
            variants={fadeInUp}
          >
            {`We are Iloilo's premier business organization. Established on October 1993, Iloilo Business Club, Inc. (IBC) is a non-stock, non-profit corporation composed of over eighty (80) Senior Executives representing the leading Corporations and Business Organizations in the Province. The Philippines is a Country divided into three (3) major islands - Luzon, Visayas and Mindanao. The Visayas, retail, utility, services, manufacturing, financial institutions, agribusiness, and the educational institutions.

Its policy formulating fact track the IBC is structured and programmed primarily by its three major thrusts - policy advocacy, information services and trade and investment promotion.

IBC's commitment is to promote the City and the Province of Iloilo as a tourist & investment destination, create opportunities to boost the local economy, and maintain a strong partnership with our government and private sector stakeholders.`}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
