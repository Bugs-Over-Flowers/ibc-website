"use client";
import { motion } from "framer-motion";
import { Building2, Lightbulb, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";

const thrusts = [
  {
    icon: Lightbulb,
    title: "Policy Advisory & Advocacy",
    description:
      "We are at the forefront of issues concerning the business sector. Iloilo Business Club, Inc. holds membership to various regional and local policy-making bodies to represent and put forth critical agenda to improve planning and development, service delivery and the local business climate.",
    extra:
      "We formulate position papers and issue official statements regarding local and national legislation and current events. We network with other local, regional and national business organizations in the country to dialogue and support advocacies that influence important reforms and policies.",
  },
  {
    icon: TrendingUp,
    title: "Investment Promotion",
    description:
      "Iloilo Business Club, Inc. is one of the founding business organizations of the Iloilo Economic Development Foundation, Inc., a non-government and non-profit consortium of public and private institutions, companies and individuals.",
    extra:
      "The Club also partners with national government agencies, private companies and individuals that assist investors and businesses in locating and growing their business in Iloilo.",
  },
  {
    icon: Building2,
    title: "Tourism, Culture, Heritage and Arts Promotion",
    description:
      "To boost efforts to promote the Province and the City of Iloilo as a tourist destination, Iloilo Business Club, Inc. pursues partnerships and roles that provide capacity development for local stakeholders, discover new markets with growth potential, and improve services and facilities.",
    extra:
      "We also collaborate with the Iloilo Dinagyang Foundation, Inc. in its administrative duties for the National Commission on Culture and the Arts (NCCA).",
  },
  {
    icon: Users,
    title: "Business Support Services",
    description:
      "Projects and activities of Iloilo Business Club are carefully selected to address the needs of its membership and the business sector in general.",
    extra:
      "Economic data and information from key national government agencies and local government units are accessed for members upon request.",
  },
];

export default function AboutThrusts() {
  return (
    <section
      className="relative scroll-mt-32 overflow-hidden py-20"
      id="thrusts"
    >
      <div className="absolute inset-0 bg-linear-to-b from-muted/30 via-transparent to-muted/30" />
      <div className="absolute top-1/2 right-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-[#2E2A6E]/10 blur-[100px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          <motion.div
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2E2A6E]/20 bg-[#2E2A6E]/10 px-4 py-2 backdrop-blur-sm"
            variants={fadeInUp}
          >
            <Lightbulb className="h-4 w-4 text-[#2E2A6E]" />
            <span className="font-medium text-[#2E2A6E] text-sm">
              Our Initiatives
            </span>
          </motion.div>
          <motion.h2
            className="mb-4 font-bold text-4xl text-[#2E2A6E]"
            variants={fadeInUp}
          >
            Company Thrusts
          </motion.h2>
          <motion.p
            className="mx-auto max-w-3xl text-foreground/70 text-lg"
            variants={fadeInUp}
          >
            Our strategic initiatives driving sustainable business growth and
            economic development in Iloilo
          </motion.p>
        </motion.div>
        <motion.div
          className="grid gap-8 md:grid-cols-2"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          {thrusts.map((thrust) => (
            <motion.div key={thrust.title} variants={fadeInUp}>
              <Card className="hover:-translate-y-1 group h-full overflow-hidden border-0 bg-white/70 shadow-xl ring-1 ring-white/50 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl">
                <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-primary via-primary/70 to-transparent" />
                <CardContent className="p-8">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                      <thrust.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-bold text-[#2E2A6E] text-xl">
                      {thrust.title}
                    </h3>
                  </div>
                  <p className="mb-4 text-foreground/80 leading-relaxed">
                    {thrust.description}
                  </p>
                  <p className="text-foreground/60 text-sm leading-relaxed">
                    {thrust.extra}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
