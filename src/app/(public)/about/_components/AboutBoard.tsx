"use client";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";

const boardMembers = [
  { name: "Juan Jose Jamora III", role: "Chairman Emeritus", featured: true },
  { name: "Ma. Luisa Segovia", role: "President", featured: true },
  { name: "Herminio Maravilla", role: "Chairman" },
  { name: "Jose Paolo Treñas", role: "Vice President" },
  { name: "Allen Son Tan", role: "Corporate Secretary" },
  { name: "Phillipp Chua", role: "Treasurer" },
  { name: "Atty. George Que", role: "Legal Counsel" },
  { name: "Francis De la Cruz", role: "Trustee" },
  { name: "Jose Hautea, Jr.", role: "Trustee" },
  { name: "Philip Joel Lataquin", role: "Trustee" },
  { name: "Jose Layson, Jr.", role: "Trustee" },
  { name: "Arsenio Rafael III", role: "Trustee" },
  { name: "Atty. Fritzie Diez-Treñas", role: "Trustee" },
  { name: "Engr. Terence Uygongco", role: "Trustee" },
  { name: "Anatole Dan Viray", role: "Trustee" },
];

const secretariat = [
  { name: "Herminia Ore", role: "Finance, Marketing, and Promotion" },
  { name: "Clea Angela Drilon", role: "Administrative Officer" },
  { name: "Joel Germino", role: "General Services" },
];

export default function AboutBoard() {
  return (
    <section
      className="relative scroll-mt-32 overflow-hidden py-20"
      id="board-of-trustees"
    >
      <div className="-translate-x-1/2 absolute top-0 left-1/2 h-[400px] w-[800px] rounded-full bg-linear-to-b from-primary/5 to-transparent blur-[100px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          <motion.div
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 backdrop-blur-sm"
            variants={fadeInUp}
          >
            <Users className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary text-sm">Leadership</span>
          </motion.div>
          <motion.h2
            className="mb-4 font-bold text-4xl text-[#2E2A6E]"
            variants={fadeInUp}
          >
            Board of Trustees
          </motion.h2>
          <motion.p
            className="mx-auto max-w-3xl text-foreground/70 text-lg"
            variants={fadeInUp}
          >
            Meet the dedicated leaders who guide the strategic direction of the
            Iloilo Business Club.
          </motion.p>
        </motion.div>
        {/* Chairman Emeritus and President - Featured */}
        <motion.div
          className="mb-12 flex flex-wrap justify-center gap-8"
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          {[boardMembers[0], boardMembers[1]].map((member) => (
            <div
              className="min-w-[260px] rounded-3xl bg-white/60 p-8 text-center shadow-xl ring-1 ring-white/50 backdrop-blur-xl"
              key={member.name}
            >
              <div className="mx-auto mb-4 flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-primary/30 to-[#2E2A6E]/30 shadow-lg ring-4 ring-white/50">
                <Users className="h-16 w-16 text-primary" />
              </div>
              <h3 className="mb-1 font-bold text-[#2E2A6E] text-xl">
                {member.name}
              </h3>
              <p className="font-medium text-primary italic">{member.role}</p>
            </div>
          ))}
        </motion.div>
        {/* Other Board Members */}
        <motion.div
          className="mb-16 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          {boardMembers.slice(2, 7).map((member) => (
            <motion.div
              className="group text-center"
              key={member.name}
              variants={fadeInUp}
            >
              <div className="rounded-2xl bg-white/50 p-4 shadow-md ring-1 ring-white/40 backdrop-blur-sm transition-all duration-300 hover:bg-white/70 hover:shadow-lg">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-primary/15 to-[#2E2A6E]/15 ring-2 ring-white/50 transition-all group-hover:ring-primary/30">
                  <Users className="h-10 w-10 text-[#2E2A6E]/60" />
                </div>
                <h3 className="mb-1 font-semibold text-[#2E2A6E] text-sm">
                  {member.name}
                </h3>
                <p className="text-foreground/60 text-xs italic">
                  {member.role}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          className="mb-16 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          {boardMembers.slice(7).map((member) => (
            <motion.div
              className="group text-center"
              key={member.name}
              variants={fadeInUp}
            >
              <div className="rounded-2xl bg-white/50 p-4 shadow-md ring-1 ring-white/40 backdrop-blur-sm transition-all duration-300 hover:bg-white/70 hover:shadow-lg">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-primary/15 to-[#2E2A6E]/15 ring-2 ring-white/50 transition-all group-hover:ring-primary/30">
                  <Users className="h-10 w-10 text-[#2E2A6E]/60" />
                </div>
                <h3 className="mb-1 font-semibold text-[#2E2A6E] text-sm">
                  {member.name}
                </h3>
                <p className="text-foreground/60 text-xs italic">
                  {member.role}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        {/* Secretariat */}
        <div className="mt-16 border-border/50 border-t pt-16">
          <motion.div
            className="mb-12 text-center"
            initial="hidden"
            variants={staggerContainer}
            viewport={{ once: true, margin: "-100px" }}
            whileInView="visible"
          >
            <motion.h2
              className="mb-4 font-bold text-3xl text-[#2E2A6E]"
              variants={fadeInUp}
            >
              Secretariat
            </motion.h2>
          </motion.div>
          <motion.div
            className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3"
            initial="hidden"
            variants={staggerContainer}
            viewport={{ once: true, margin: "-100px" }}
            whileInView="visible"
          >
            {secretariat.map((member) => (
              <motion.div
                className="text-center"
                key={member.name}
                variants={fadeInUp}
              >
                <div className="rounded-2xl bg-white/50 p-6 shadow-md ring-1 ring-white/40 backdrop-blur-sm transition-all duration-300 hover:bg-white/70 hover:shadow-lg">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-muted to-muted/50 ring-2 ring-white/50">
                    <Users className="h-12 w-12 text-foreground/40" />
                  </div>
                  <h3 className="mb-1 font-semibold text-[#2E2A6E] text-sm">
                    {member.name}
                  </h3>
                  <p className="text-foreground/60 text-xs">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
