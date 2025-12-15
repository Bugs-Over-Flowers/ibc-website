"use client";

import { User } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

const boardOfTrustees = [
  { name: "Juan Jose Jamora III", position: "Chairman Emeritus" },
  { name: "Ma. Luisa Segovia", position: "President" },
  { name: "Herminio Maravilla", position: "Chairman" },
  { name: "Jose Paolo Treñas", position: "Vice President" },
  { name: "Allen Son Tan", position: "Corporate Secretary" },
  { name: "Phillipp Chua", position: "Treasurer" },
  { name: "Atty. George Que", position: "Legal Counsel" },
  { name: "Francis De la Cruz", position: "Trustee" },
  { name: "Jose Hautea, Jr.", position: "Trustee" },
  { name: "Philip Joel Lataquin", position: "Trustee" },
  { name: "Jose Layson, Jr.", position: "Trustee" },
  { name: "Arsenio Rafael III", position: "Trustee" },
  { name: "Atty. Fritzie Diez-Treñas", position: "Trustee" },
  { name: "Engr. Terence Uygongco", position: "Trustee" },
  { name: "Anatole Dan Viray", position: "Trustee" },
];

const secretariat = [
  { name: "Herminia Ore", position: "Finance, Marketing, and Promotion" },
  { name: "Clea Angela Drilon", position: "Administrative Officer" },
  { name: "Joel Germino", position: "General Services" },
];

export function AboutBoard() {
  return (
    <>
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <span className="mb-4 inline-block rounded-lg bg-primary/10 px-4 py-1.5 font-medium text-primary text-sm">
              Leadership
            </span>
            <h2 className="mb-4 text-balance font-bold text-3xl text-foreground sm:text-4xl">
              Board of Trustees
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Meet the dedicated leaders who guide the strategic direction of
              the Iloilo Business Club
            </p>
          </motion.div>

          {/* Featured Board Members (Chairman Emeritus, President) */}
          <div className="mb-10 flex flex-wrap justify-center gap-8">
            {boardOfTrustees.slice(0, 2).map((member, index) => (
              <motion.div
                className="flex h-[340px] w-[260px] flex-col items-center justify-center rounded-3xl bg-white/60 p-8 text-center shadow-xl ring-1 ring-white/50 backdrop-blur-xl"
                initial={{ opacity: 0, y: 20 }}
                key={member.name}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-16 w-16 text-primary/40" />
                </div>
                <h3 className="mb-2 font-bold text-foreground text-lg">
                  {member.name}
                </h3>
                <p className="font-medium text-base text-primary">
                  {member.position}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Officers: Chairman, Vice President, Corporate Secretary, Treasurer, Legal Counsel */}
          <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {boardOfTrustees.slice(2, 7).map((member, index) => (
              <motion.div
                className="group mx-auto flex h-[300px] w-[220px] flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-card"
                initial={{ opacity: 0, y: 20 }}
                key={member.name}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-12 w-12 text-primary/30" />
                </div>
                <h3 className="mb-2 font-semibold text-base text-foreground">
                  {member.name}
                </h3>
                <p className="text-primary text-xs">{member.position}</p>
              </motion.div>
            ))}
          </div>

          {/* Trustees: 8, 4 columns, 2 rows */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            {boardOfTrustees.slice(7).map((member, index) => (
              <motion.div
                className="group mx-auto flex h-[300px] w-[220px] flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-card"
                initial={{ opacity: 0, y: 20 }}
                key={member.name}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-12 w-12 text-primary/30" />
                </div>
                <h3 className="mb-2 font-semibold text-base text-foreground">
                  {member.name}
                </h3>
                <p className="text-primary text-xs">{member.position}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <span className="mb-4 inline-block rounded-lg bg-primary/10 px-4 py-1.5 font-medium text-primary text-sm">
              Our Team
            </span>
            <h2 className="mb-4 text-balance font-bold text-3xl text-foreground sm:text-4xl">
              Secretariat
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              The dedicated team that keeps IBC running smoothly
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-3">
            {secretariat.map((member, index) => (
              <motion.div
                className="group overflow-hidden rounded-xl border border-border bg-background"
                initial={{ opacity: 0, y: 20 }}
                key={member.name}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="relative aspect-square overflow-hidden"></div>
                <div className="p-5 text-center">
                  <h3 className="font-semibold text-foreground">
                    {member.name}
                  </h3>
                  <p className="text-primary text-sm">{member.position}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
